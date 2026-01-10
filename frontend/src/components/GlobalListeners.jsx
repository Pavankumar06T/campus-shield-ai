import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useToast } from './ToastContext';
import { Siren, Info, AlertTriangle } from 'lucide-react';

const GlobalListeners = () => {
    const { addToast } = useToast();

    useEffect(() => {
        // Listen for the latest broadcast
        const q = query(
            collection(db, "broadcasts"),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        let isInitialLoad = true;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const broadcast = snapshot.docs[0].data();
                const broadcastTime = broadcast.timestamp?.seconds * 1000;
                const now = Date.now();

               

                const isRecent = (now - broadcastTime) < 60000; // 1 minute

                if (isRecent && !isInitialLoad) {
                    

                    addToast(
                        <div>
                            <p className="font-black uppercase tracking-widest text-xs mb-1 opacity-80">{broadcast.title}</p>
                            <p className="text-sm font-bold">{broadcast.message}</p>
                        </div>,
                        broadcast.type || 'info' 
                    );
                }
            }
            isInitialLoad = false;
        });

        return () => unsubscribe();
    }, [addToast]);

    return null; 
};

export default GlobalListeners;
