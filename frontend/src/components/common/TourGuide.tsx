import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '../../context/AuthContext';

const TourGuide = () => {
  const { user } = useAuth();

  useEffect(() => {
    const seen = localStorage.getItem('tour_done');
    if (seen) return;

    const steps: DriveStep[] = [
      {
        element: '.navbar__brand',
        popover: {
          title: '🏥 Welcome to MediConnect!',
          description: 'India ka trusted healthcare platform. Doctors dhundho, appointments book karo — sab kuch yahan!',
          side: 'bottom' as const,
        }
      },
      {
        element: '.navbar__links a:first-child',
        popover: {
          title: '🔍 Find Doctors',
          description: 'Specialization aur city se filter karke apna doctor dhundho.',
          side: 'bottom' as const,
        }
      },
      {
        element: '.hero__actions a:first-child',
        popover: {
          title: '📅 Book Instantly',
          description: 'Sirf 3 steps mein appointment book ho jaati hai — no phone calls needed!',
          side: 'top' as const,
        }
      },
      {
        element: '.spec-grid',
        popover: {
          title: '🩺 Browse by Specialty',
          description: 'Cardiologist, Dermatologist, ya koi bhi specialist — seedha category se choose karo.',
          side: 'top' as const,
        }
      },
      {
        element: '.hero__stats',
        popover: {
          title: '✅ Trusted Platform',
          description: '500+ verified doctors aur 10,000+ happy patients ke saath India mein growing healthcare network.',
          side: 'top' as const,
        }
      },
    ];

    if (!user) {
      steps.push({
        element: '.navbar__actions a:last-child',
        popover: {
          title: '🚀 Join Free!',
          description: 'Register karo as patient ya doctor — bilkul free hai!',
          side: 'bottom' as const,
        }
      });
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0,0,0,0.6)',
      stagePadding: 8,
      popoverClass: 'mediconnect-tour',
      steps,
      onDestroyStarted: () => {
        localStorage.setItem('tour_done', 'true');
        driverObj.destroy();
      },
    });

    const timer = setTimeout(() => driverObj.drive(), 1200);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default TourGuide;