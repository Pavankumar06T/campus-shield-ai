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

                // 1. Avoid showing old broadcasts on page reload (only show if < 10 seconds old or triggered after load)
                // However, onSnapshot fires immediately with current data. 
                // We handle this by ignoring the VERY first snapshot if it's old data. 
                // But for "Mass Broadcast" we often want to see the latest one if we just logged in and it's active?
                // Let's settle on: Show if it was sent in the last 60 seconds.

                const isRecent = (now - broadcastTime) < 60000; // 1 minute

                if (isRecent && !isInitialLoad) {
                    // Play Sound?
                    // const audio = new Audio('/alert.mp3'); audio.play().catch(e=>console.log(e));

                    addToast(
                        <div>
                            <p className="font-black uppercase tracking-widest text-xs mb-1 opacity-80">{broadcast.title}</p>
                            <p className="text-sm font-bold">{broadcast.message}</p>
                        </div>,
                        broadcast.type || 'info' // info, warning, critical
                    );
                }
            }
            isInitialLoad = false;
        });

        return () => unsubscribe();
    }, [addToast]);

    return null; // Logic only component
};

export default GlobalListeners;
