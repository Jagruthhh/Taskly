import { create } from 'zustand';
import toast from 'react-hot-toast';
import { 
  auth, 
  db,
  googleProvider, 
  isFirebaseConfigured 
} from '../utils/firebase.config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';

export const useAuthStore = create((set, get) => {
  
  // Dynamic stats calculator directly on client
  const calculateStats = (tasksList) => {
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter((t) => t.isCompleted).length;
    const activeTasks = totalTasks - completedTasks;
    const highPriority = tasksList.filter((t) => t.priority === 'HIGH').length;
    const mediumPriority = tasksList.filter((t) => t.priority === 'MEDIUM').length;
    const lowPriority = tasksList.filter((t) => t.priority === 'LOW').length;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      highPriority,
      mediumPriority,
      lowPriority
    };
  };

  const resetAuthState = () => ({
    user: null,
    isAuthenticated: false,
    tasks: [],
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    },
    isLoading: false
  });

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Initial app session load
    isTasksLoading: false,
    tasks: [],
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    },

    // Email/Password login
    login: async (email, password) => {
      set({ isLoading: true });

      if (!isFirebaseConfigured) {
        // Offline Mock Login
        const mockUser = {
          id: 'mock-developer-uid-123',
          name: 'Local Developer',
          email: 'developer@taskly.com',
          avatar: { initials: 'DV', bgColor: '#6366F1', imageUrl: '' }
        };
        localStorage.setItem('taskly_mock_session', 'true');
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false
        });
        toast.success(`Welcome to Taskly (MOCK Mode), Local Developer!`);
        get().fetchTasks();
        return { success: true };
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        let errMsg = 'Login failed';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errMsg = 'Invalid email or password';
        }
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    },

    // Email/Password registration
    register: async (name, email, password) => {
      set({ isLoading: true });

      if (!isFirebaseConfigured) {
        // Offline Mock Register
        const mockUser = {
          id: 'mock-developer-uid-123',
          name: name || 'Local Developer',
          email: email,
          avatar: { initials: name ? name.substring(0, 2).toUpperCase() : 'DV', bgColor: '#6366F1', imageUrl: '' }
        };
        localStorage.setItem('taskly_mock_session', 'true');
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false
        });
        toast.success(`Welcome to Taskly (MOCK Mode), ${mockUser.name}!`);
        get().fetchTasks();
        return { success: true };
      }

      try {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        await updateFirebaseProfile(credentials.user, { displayName: name });
        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        let errMsg = 'Registration failed';
        if (error.code === 'auth/email-already-in-use') {
          errMsg = 'Email is already in use';
        }
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    },

    // Google Sign-In
    loginWithGoogle: async () => {
      set({ isLoading: true });

      if (!isFirebaseConfigured) {
        return get().login('google@developer.com', 'dummy-password');
      }

      try {
        await signInWithPopup(auth, googleProvider);
        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        let errMsg = 'Google Sign-In failed';
        if (error.code !== 'auth/popup-closed-by-user') {
          toast.error(errMsg);
        }
        return { success: false, error: errMsg };
      }
    },

    // Sign out
    logout: async () => {
      set({ isLoading: true });

      if (!isFirebaseConfigured) {
        localStorage.removeItem('taskly_mock_session');
        localStorage.removeItem('taskly_mock_tasks');
        localStorage.removeItem('taskly_mock_profile');
        set(resetAuthState());
        toast.success('Logged out successfully (MOCK).');
        return;
      }

      try {
        await signOut(auth);
        set(resetAuthState());
        toast.success('Logged out successfully.');
      } catch (error) {
        set({ isLoading: false });
        toast.error('Sign-out failed');
      }
    },

    // Reactive Auth State & Firestore Sync Listener on mount
    checkAuth: async () => {
      set({ isLoading: true });

      try {
        if (!isFirebaseConfigured || !auth || !db) {
          // Offline Developer Mock Restore check
          const isMockActive = localStorage.getItem('taskly_mock_session') === 'true';
          if (isMockActive) {
            let savedProfile = {
              id: 'mock-developer-uid-123',
              name: 'Local Developer',
              email: 'developer@taskly.com',
              avatar: { initials: 'DV', bgColor: '#6366F1', imageUrl: '' },
              streak: 0,
              lastActiveDate: ''
            };
            try {
              const cached = localStorage.getItem('taskly_mock_profile');
              if (cached) savedProfile = JSON.parse(cached);
            } catch (e) {}

            // Calculate mock active streak (client-side offline simulation)
            const todayStr = new Date().toLocaleDateString('en-CA');
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('en-CA');

            let currentStreak = savedProfile.streak || 0;
            let lastActive = savedProfile.lastActiveDate || '';

            if (lastActive !== todayStr) {
              if (lastActive === yesterdayStr) {
                currentStreak += 1;
              } else {
                currentStreak = 1;
              }
              savedProfile.streak = currentStreak;
              savedProfile.lastActiveDate = todayStr;
              localStorage.setItem('taskly_mock_profile', JSON.stringify(savedProfile));
              console.log(`[MOCK STREAK] Active streak updated to ${currentStreak} days!`);
            }

            set({
              user: savedProfile,
              isAuthenticated: true,
              isLoading: false
            });
            get().fetchTasks();
          } else {
            set(resetAuthState());
          }
          return;
        }

        // actual Firestore session listeners mapping safely wrapped in try-catch
        onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const uid = firebaseUser.uid;
              
              // Look up Firestore User profile safely
              const userDocRef = doc(db, 'users', uid);
              
              let userDocSnap;
              try {
                userDocSnap = await getDoc(userDocRef);
              } catch (fsError) {
                console.error('Firestore Read Error:', fsError);
                toast.error('Firestore Database unavailable. Please make sure you have enabled "Cloud Firestore" in your Firebase Console!');
                set(resetAuthState());
                return;
              }
              
              const todayStr = new Date().toLocaleDateString('en-CA');
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toLocaleDateString('en-CA');

              let profileData;

              if (!userDocSnap.exists()) {
                // --- DYNAMIC REGISTER SYNC IN FIRESTORE ---
                console.log(`[FIRESTORE] Provisioning new user profile in db: ${firebaseUser.email}`);
                const computedName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
                const initials = computedName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'US';
                const defaultColors = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
                const bgColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];

                const defaultAvatar = {
                  initials,
                  bgColor,
                  imageUrl: firebaseUser.photoURL || ''
                };

                profileData = {
                  id: uid,
                  name: computedName,
                  email: firebaseUser.email || `${uid}@firebase.com`,
                  avatar: JSON.stringify(defaultAvatar),
                  createdAt: new Date().toISOString(),
                  streak: 1,
                  lastActiveDate: todayStr
                };

                try {
                  await setDoc(userDocRef, profileData);
                } catch (fsWriteError) {
                  console.error('Firestore Write Error:', fsWriteError);
                  toast.error('Firestore Write permission denied. Please verify your Firestore Security Rules in the Firebase Console!');
                  set(resetAuthState());
                  return;
                }
              } else {
                profileData = userDocSnap.data();

                // Calculate active streak
                let currentStreak = profileData.streak || 0;
                let lastActive = profileData.lastActiveDate || '';

                if (lastActive !== todayStr) {
                  if (lastActive === yesterdayStr) {
                    currentStreak += 1;
                  } else {
                    currentStreak = 1;
                  }

                  try {
                    await updateDoc(userDocRef, {
                      streak: currentStreak,
                      lastActiveDate: todayStr
                    });
                    profileData.streak = currentStreak;
                    profileData.lastActiveDate = todayStr;
                    console.log(`[STREAK] Active streak updated to ${currentStreak} days!`);
                  } catch (fsUpdateError) {
                    console.error('Firestore Streak Update Error:', fsUpdateError);
                  }
                }
              }

              // Parse avatar string safely
              let parsedAvatar;
              try {
                parsedAvatar = typeof profileData.avatar === 'string' ? JSON.parse(profileData.avatar) : profileData.avatar;
              } catch (e) {
                parsedAvatar = { initials: 'US', bgColor: '#6366F1', imageUrl: '' };
              }

              set({
                user: {
                  ...profileData,
                  id: uid, // Enforce id is always set to active Firebase UID!
                  avatar: parsedAvatar
                },
                isAuthenticated: true,
                isLoading: false
              });

              // Load tasks reactively
              get().fetchTasks();
            } else {
              set(resetAuthState());
            }
          } catch (callbackErr) {
            console.error('Error inside Firebase Auth state listener callback:', callbackErr);
            set(resetAuthState());
          }
        });
      } catch (globalErr) {
        console.error('Global checkAuth exception:', globalErr);
        set(resetAuthState());
      }
    },

    // Edit user display details in Firestore
    updateProfile: async (profileData) => {
      const uid = get().user?.id || auth.currentUser?.uid;
      if (!uid) return { success: false };

      try {
        if (!isFirebaseConfigured) {
          // Mock profile update
          const updatedUser = {
            ...get().user,
            name: profileData.name,
            avatar: profileData.avatar
          };
          localStorage.setItem('taskly_mock_profile', JSON.stringify(updatedUser));
          set({ user: updatedUser });
          toast.success('Profile updated successfully (MOCK)!');
          return { success: true };
        }

        // Firebase Auth Profile Update
        if (auth.currentUser && profileData.name) {
          await updateFirebaseProfile(auth.currentUser, {
            displayName: profileData.name
          });
        }

        // Firestore database Update
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
          name: profileData.name,
          avatar: JSON.stringify(profileData.avatar)
        });

        set((state) => ({
          user: {
            ...state.user,
            name: profileData.name,
            avatar: profileData.avatar
          }
        }));

        toast.success('Profile updated successfully!');
        return { success: true };
      } catch (error) {
        toast.error('Profile update failed');
        return { success: false };
      }
    },

    // Change password via client Firebase Auth directly
    changePassword: async (currentPassword, newPassword) => {
      if (!isFirebaseConfigured) {
        toast.success('Password updated successfully (MOCK)!');
        return { success: true };
      }

      try {
        const user = auth.currentUser;
        if (user) {
          await updateFirebasePassword(user, newPassword);
          toast.success('Password updated securely in Firebase!');
          return { success: true };
        } else {
          throw new Error('No user logged in.');
        }
      } catch (error) {
        let errMsg = 'Password update failed';
        if (error.code === 'auth/requires-recent-login') {
          errMsg = 'Please log out and log back in to verify your identity before changing passwords.';
        }
        toast.error(errMsg);
        return { success: false, error: errMsg };
      }
    },

    // Sync profile stats in background dynamically on client
    fetchProfileStats: async () => {
      set({ stats: get().tasks.length ? calculateStats(get().tasks) : get().stats });
    },

    // Tasks CRUD: Fetch tasks scoped to user in Firestore
    fetchTasks: async () => {
      const uid = get().user?.id || auth.currentUser?.uid;
      if (!uid) return;

      set({ isTasksLoading: true });

      if (!isFirebaseConfigured) {
        // Mock fetch tasks
        let mockTasks = [];
        try {
          const cached = localStorage.getItem('taskly_mock_tasks');
          if (cached) mockTasks = JSON.parse(cached);
        } catch (e) {}
        
        // Sort by order asc
        mockTasks.sort((a, b) => a.order - b.order);
        set({
          tasks: mockTasks,
          stats: calculateStats(mockTasks),
          isTasksLoading: false
        });
        return;
      }

      try {
        const tasksRef = collection(db, 'tasks');
        const q = query(
          tasksRef,
          where('userId', '==', uid),
          orderBy('order', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const tasksList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        set({
          tasks: tasksList,
          stats: calculateStats(tasksList),
          isTasksLoading: false
        });
      } catch (error) {
        console.error('Failed to fetch tasks from Firestore:', error);
        set({ isTasksLoading: false });
      }
    },

    // Tasks CRUD: Add Doc
    addTask: async (taskData) => {
      const uid = get().user?.id || auth.currentUser?.uid;
      if (!uid) return { success: false };

      const orderIndex = get().tasks.length;

      const preparedTask = {
        ...taskData,
        userId: uid,
        isCompleted: false,
        order: orderIndex,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!isFirebaseConfigured) {
        // Mock add task
        const mockId = `mock-task-${Date.now()}`;
        const newTask = { id: mockId, ...preparedTask };
        const updatedList = [...get().tasks, newTask];
        
        localStorage.setItem('taskly_mock_tasks', JSON.stringify(updatedList));
        set({
          tasks: updatedList,
          stats: calculateStats(updatedList)
        });
        toast.success('Task added successfully!');
        return { success: true, task: newTask };
      }

      try {
        const docRef = await addDoc(collection(db, 'tasks'), preparedTask);
        const newTask = { id: docRef.id, ...preparedTask };

        set((state) => {
          const updatedList = [...state.tasks, newTask];
          return {
            tasks: updatedList,
            stats: calculateStats(updatedList)
          };
        });

        toast.success('Task added successfully!');
        return { success: true, task: newTask };
      } catch (error) {
        toast.error('Failed to add task');
        return { success: false };
      }
    },

    // Tasks CRUD: Update Doc (Optimistic)
    updateTask: async (taskId, updatedData) => {
      const originalTasks = get().tasks;
      
      const optimisticList = originalTasks.map((t) =>
        t.id === taskId ? { ...t, ...updatedData } : t
      );

      set({
        tasks: optimisticList,
        stats: calculateStats(optimisticList)
      });

      if (!isFirebaseConfigured) {
        localStorage.setItem('taskly_mock_tasks', JSON.stringify(optimisticList));
        return { success: true };
      }

      try {
        const taskDocRef = doc(db, 'tasks', taskId);
        await updateDoc(taskDocRef, {
          ...updatedData,
          updatedAt: new Date().toISOString()
        });
        return { success: true };
      } catch (error) {
        // Rollback
        set({
          tasks: originalTasks,
          stats: calculateStats(originalTasks)
        });
        toast.error('Failed to update task');
        return { success: false };
      }
    },

    // Tasks CRUD: Toggle status (Optimistic)
    toggleTask: async (taskId) => {
      const originalTasks = get().tasks;
      const task = originalTasks.find((t) => t.id === taskId);
      if (!task) return;

      const nextStatus = !task.isCompleted;

      const optimisticList = originalTasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: nextStatus } : t
      );

      set({
        tasks: optimisticList,
        stats: calculateStats(optimisticList)
      });

      if (!isFirebaseConfigured) {
        localStorage.setItem('taskly_mock_tasks', JSON.stringify(optimisticList));
        return;
      }

      try {
        const taskDocRef = doc(db, 'tasks', taskId);
        await updateDoc(taskDocRef, {
          isCompleted: nextStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        // Rollback
        set({
          tasks: originalTasks,
          stats: calculateStats(originalTasks)
        });
        toast.error('Failed to toggle task');
      }
    },

    // Tasks CRUD: Delete and Re-index remaining (Optimistic + Write Batch)
    deleteTask: async (taskId) => {
      const originalTasks = get().tasks;
      
      // Wipe the item, and recompute indices from 0 up
      const refinedList = originalTasks
        .filter((t) => t.id !== taskId)
        .map((t, index) => ({ ...t, order: index }));

      set({
        tasks: refinedList,
        stats: calculateStats(refinedList)
      });

      if (!isFirebaseConfigured) {
        localStorage.setItem('taskly_mock_tasks', JSON.stringify(refinedList));
        toast.success('Task deleted successfully');
        return { success: true };
      }

      try {
        // 1. Delete document
        const taskDocRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskDocRef);

        // 2. Transactionally re-index subsequent order indices in a Write Batch
        if (refinedList.length > 0) {
          const batch = writeBatch(db);
          refinedList.forEach((t) => {
            batch.update(doc(db, 'tasks', t.id), { order: t.order });
          });
          await batch.commit();
        }

        toast.success('Task deleted successfully');
        return { success: true };
      } catch (error) {
        // Rollback
        set({
          tasks: originalTasks,
          stats: calculateStats(originalTasks)
        });
        toast.error('Failed to delete task');
        return { success: false };
      }
    },

    // Tasks CRUD: Reorder (Optimistic UI + Firestore Write Batches)
    reorderTasks: async (newOrderedTasks) => {
      const originalTasks = get().tasks;
      
      set({
        tasks: newOrderedTasks,
        stats: calculateStats(newOrderedTasks)
      });

      if (!isFirebaseConfigured) {
        localStorage.setItem('taskly_mock_tasks', JSON.stringify(newOrderedTasks));
        return;
      }

      try {
        // Write Batch commit reordering to Firestore atomically
        const batch = writeBatch(db);
        newOrderedTasks.forEach((t) => {
          batch.update(doc(db, 'tasks', t.id), { order: t.order });
        });
        await batch.commit();
      } catch (error) {
        // Rollback
        set({
          tasks: originalTasks,
          stats: calculateStats(originalTasks)
        });
        toast.error('Reordering sync failed.');
      }
    }
  };
});
