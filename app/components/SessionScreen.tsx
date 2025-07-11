"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface TeamSession {
  teamCode: string;
  startTime: Date;
  endTime: Date | null;
  questionType: number | null;
  isCompleted: boolean;
  remainingTimeMs: number;
}

interface SessionScreenProps {
  session: TeamSession | null;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSessionScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuestionSelector: React.Dispatch<React.SetStateAction<boolean>>;
}

// Format time helper function
const formatTime = (ms: number): string => {
  // Format milliseconds to "hh:mm:ss" format
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const SessionScreen: React.FC<SessionScreenProps> = ({ 
  session, 
  setShowWelcome, 
  setShowSessionScreen, 
  setShowQuestionSelector
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [startingGame, setStartingGame] = useState(false);
  
  // Track if session is complete
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  
  useEffect(() => {
    if (session) {
      // Set initial time
      setTimeLeft(formatTime(session.remainingTimeMs));
      
      // Check if session is already completed
      setIsSessionComplete(!!session.isCompleted);
      
      // Also check if there's a submission (which means the session should be completed)
      const checkSubmission = async () => {
        if (!session.isCompleted && session.teamCode) {
          try {
            const response = await fetch(`/api/check-submission?teamCode=${session.teamCode}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            
            const data = await response.json();
            if (data.success && data.hasSubmission) {
              // If there's a submission but session is not marked as completed yet,
              // update our local state
              setIsSessionComplete(true);
              
              // Also update the session in the database
              try {
                await fetch("/api/onboarding-session", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    teamCode: session.teamCode, 
                    isCompleted: true 
                  }),
                });
                
                // Update the session object
                if (session) {
                  session.isCompleted = true;
                }
              } catch (updateErr) {
                console.error("Error updating session completion status:", updateErr);
              }
            }
          } catch (err) {
            console.error("Error checking submission status:", err);
          }
        }
      };
      
      checkSubmission();
      
      // Update timer every second only if session is not completed
      const timer = setInterval(() => {
        if (session.remainingTimeMs <= 0 || session.isCompleted || isSessionComplete) {
          clearInterval(timer);
          return;
        }
        
        // Calculate new time
        const newRemainingTime = session.remainingTimeMs - 1000;
        session.remainingTimeMs = newRemainingTime;
        
        // Update display
        setTimeLeft(formatTime(newRemainingTime));
        
        // Stop if time runs out
        if (newRemainingTime <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
      // Clean up on unmount
      return () => clearInterval(timer);
    }
  }, [session]);
  
  const handleStartGame = () => {
    setStartingGame(true);
    
    // Navigate to question selector
    setTimeout(() => {
      setShowSessionScreen(false);
      setShowQuestionSelector(true);
      setStartingGame(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col justify-center items-center px-4">
      {/* Time Remaining Display - Top Left */}
      <div className="absolute top-5 left-5 bg-[#e30f53] bg-opacity-20 px-4 py-2 rounded-md z-20">
        <span className="text-white font-mono text-lg font-bold">Time Remaining: {timeLeft}</span>
      </div>
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Main Title */}
        <div className="mb-8">
          <div className="flex flex-col justify-center mb-6">
            <img src="/duo_5.svg" alt="DUOTHAN 5.0" className="h-10 sm:h-16 mx-auto" />
            <p className="text-sm text-gray-300 mt-2">
              Onboarding Session
            </p>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Begin?</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Your onboarding session is ready. You have 12 hours to complete the onboarding process once started.
          </p>
        </div>
        
        {/* Session Timer */}
        <div className={`bg-white bg-opacity-5 backdrop-blur-lg border p-6 sm:p-8 max-w-md mx-auto mb-10 rounded-md ${
          session?.isCompleted 
            ? 'border-green-500' 
            : 'border-white border-opacity-10'
        }`}>
          <h2 className="text-xl font-semibold text-white mb-2">
            {session?.isCompleted 
              ? "Session Completed" 
              : "Session Time Remaining"}
          </h2>
          
          {session?.isCompleted ? (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-2xl font-medium text-green-500">Submission Complete</div>
            </div>
          ) : (
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[#e30f53] mb-4">
              {timeLeft}
            </div>
          )}
          
          <p className="text-gray-400 text-sm">
            {session?.isCompleted 
              ? "Your session is complete. You cannot make further submissions." 
              : "Your session will expire after 12 hours from the start time."}
          </p>
        </div>
        
        {/* Start/View Button */}
        <Button 
          onClick={handleStartGame}
          disabled={startingGame}
          className={`
            px-10 py-4 text-xl font-bold transition-all duration-300 shadow-lg
            ${session?.isCompleted 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-[#e30f53] hover:bg-[#b50c43] hover:scale-105 active:scale-95'}
          `}
        >
          {session?.isCompleted 
            ? "View Submission" 
            : startingGame 
              ? "Starting..." 
              : "Let's Game!"}
          <Zap className={`ml-2 w-5 h-5 ${startingGame ? 'animate-pulse' : ''}`} />
        </Button>
        
        {/* Back to Home */}
        <div className="mt-8">
          <Button 
            onClick={() => setShowWelcome(true)}
            variant="outline"
            className="border-[#e30f53] text-[#e30f53] hover:bg-[#e30f53] hover:text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
