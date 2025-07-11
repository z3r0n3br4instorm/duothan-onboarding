"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Trophy } from "lucide-react";

interface TeamSession {
  teamCode: string;
  startTime: Date;
  endTime: Date | null;
  questionType: number | null;
  isCompleted: boolean;
  remainingTimeMs: number;
}

interface WelcomeScreenProps {
  teamCode: string;
  setTeamCode: React.Dispatch<React.SetStateAction<string>>;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRegistration: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuestionSelector: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSessionScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setSession: React.Dispatch<React.SetStateAction<TeamSession | null>>;
  setSelectedQuestionType: React.Dispatch<React.SetStateAction<number | null>>;
  setIsTeamCodeValid: React.Dispatch<React.SetStateAction<boolean>>;
}

// Function to check if team code is valid
const validateTeamCode = async (code: string): Promise<{
  valid: boolean, 
  error?: string, 
  teamCode?: any,
  isRegistered?: boolean
}> => {
  try {
    const response = await fetch("/api/validate-teamcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamCode: code }),
    });
    
    const data = await response.json();
    return { 
      valid: data.valid, 
      error: data.error, 
      teamCode: data.teamCode,
      isRegistered: data.isRegistered
    };
  } catch (err) {
    return { valid: false, error: "Network error validating team code" };
  }
};

// Function to start or get session
const getOrStartSession = async (teamCode: string, questionType: number | null = null, forceRestart: boolean = false): Promise<{
  success: boolean,
  session?: TeamSession,
  error?: string
}> => {
  try {
    const response = await fetch("/api/onboarding-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamCode, questionType, forceRestart }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        success: false,
        error: data.error || "Failed to start session"
      };
    }
    
    return {
      success: true,
      session: data.session as TeamSession
    };
  } catch (err) {
    return { 
      success: false,
      error: "Network error occurred"
    };
  }
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  teamCode,
  setTeamCode,
  setShowWelcome,
  setShowRegistration,
  setShowQuestionSelector,
  setShowSessionScreen,
  setSession,
  setSelectedQuestionType,
  setIsTeamCodeValid
}) => {
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [error, setError] = useState("");

  const [sessionInfo, setSessionInfo] = useState<{
    hasActiveSession: boolean;
    sessionTimeRemaining: number;
    questionType: number | null;
    sessionCompleted?: boolean;
  } | null>(null);

  const handleTeamCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamCode.trim()) {
      setError("Please enter a team code");
      return;
    }
    
    setIsCheckingCode(true);
    setError("");
    setSessionInfo(null);
    
    try {
      const validationResult = await validateTeamCode(teamCode.trim());
      
      if (validationResult.valid) {
        setIsTeamCodeValid(true);
        
        // If team is registered, check for existing session
        if (validationResult.isRegistered) {
          // First check if there's a submission for this team
          let hasSubmission = false;
          try {
            const submissionResponse = await fetch(`/api/check-submission?teamCode=${teamCode.trim()}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            
            const submissionData = await submissionResponse.json();
            if (submissionData.success && submissionData.hasSubmission) {
              hasSubmission = true;
            }
          } catch (submissionErr) {
            console.error("Error checking submission status:", submissionErr);
          }
          
          const sessionResult = await getOrStartSession(teamCode.trim());
          
          if (sessionResult.success && sessionResult.session) {
            // If there's a submission but session is not marked as completed,
            // update the session to mark it as completed
            let updatedSession = sessionResult.session;
            
            if (hasSubmission && !sessionResult.session.isCompleted) {
              try {
                const updateResponse = await fetch("/api/onboarding-session", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    teamCode: teamCode.trim(), 
                    isCompleted: true 
                  }),
                });
                
                const updateData = await updateResponse.json();
                if (updateData.success && updateData.session) {
                  updatedSession = updateData.session;
                }
              } catch (updateErr) {
                console.error("Error updating session completion status:", updateErr);
              }
            }
            
            // Set session information
            // Only consider the session active if it has a question type AND a start time
            const hasStartTime = updatedSession.startTime !== null;
            const hasActiveSession = updatedSession.questionType !== null && 
                                    (hasStartTime && updatedSession.remainingTimeMs > 0);
            
            // Mark session as completed if we have a submission
            const isCompleted = updatedSession.isCompleted || hasSubmission;
            
            if (hasActiveSession || isCompleted) {
              // Store session info for the UI to show options
              setSessionInfo({
                hasActiveSession: hasActiveSession && !isCompleted,
                sessionTimeRemaining: updatedSession.remainingTimeMs || (12 * 60 * 60 * 1000), // Default to 12 hours if not set
                questionType: updatedSession.questionType,
                sessionCompleted: isCompleted
              });
              // Store the session with updated completion status
              setSession({
                ...updatedSession,
                isCompleted: isCompleted,
                remainingTimeMs: updatedSession.remainingTimeMs || (12 * 60 * 60 * 1000) // Ensure we have a valid time
              });
            } else {
              // If no active session or completed, show question selection
              setSession(sessionResult.session);
              setShowWelcome(false);
              setShowQuestionSelector(true);
            }
          } else {
            // No session found, create a new one
            const newSessionResult = await getOrStartSession(teamCode.trim(), null, true);
            if (newSessionResult.success && newSessionResult.session) {
              // Make sure to set a valid remainingTimeMs for new sessions
              setSession({
                ...newSessionResult.session,
                // Ensure new sessions have the full 12 hours available
                remainingTimeMs: 12 * 60 * 60 * 1000
              });
              setShowWelcome(false);
              setShowQuestionSelector(true);
            } else {
              setError(newSessionResult.error || "Failed to start session");
            }
          }
        } else {
          // For unregistered teams, proceed to registration
          setShowWelcome(false);
          setShowRegistration(true);
        }
      } else {
        setError(validationResult.error || "Invalid team code");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsCheckingCode(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Main Title */}
        <div className="mb-10 sm:mb-16">
          <div className="flex flex-col justify-center mb-2">
            <img src="/duo_5.svg" alt="DUOTHAN 5.0" className="h-10 sm:h-16 mx-auto" />
            <p className="text-sm text-gray-300 mb-3">
              Powered by IEEE NSBM
            </p>
          </div>
        </div>

        {/* Team Code Input */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleTeamCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamCode" className="text-white font-medium text-left block">
                Enter Team Code
              </Label>
              <Input
                id="teamCode"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="e.g., xxxxxxxxx"
                className="bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                disabled={isCheckingCode}
              />
            </div>
            
            {error && (
              <Alert className="bg-red-500 bg-opacity-10 border-red-500 text-left">
                <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {!sessionInfo ? (
              <Button 
                type="submit"
                disabled={isCheckingCode}
                className="w-full bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white px-6 py-3 text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg"
              >
                {isCheckingCode ? "Validating..." : "Enter Competition"}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            ) : (
              <div className="space-y-4">
                <div className={`bg-white bg-opacity-10 border rounded-lg p-4 text-white text-left ${
                sessionInfo.sessionCompleted ? 'border-green-500' : 'border-[#e30f53]'
              }`}>
                  <p className="mb-3 font-medium flex items-center">
                    {sessionInfo.sessionCompleted ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-500">Your team has completed submission!</span>
                      </>
                    ) : (
                      <span className="text-[#e30f53]">Your team has an active session!</span>
                    )}
                  </p>
                  {/* Only show Question Type and Time Remaining if session is not completed */}
                  {!sessionInfo.sessionCompleted && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span>Question Type:</span>
                        <span className="font-semibold">Type {sessionInfo.questionType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Time Remaining:</span>
                        <span className="font-semibold">
                          {Math.floor((sessionInfo.sessionTimeRemaining || (12 * 60 * 60 * 1000)) / (1000 * 60 * 60))} hours {" "}
                          {Math.floor(((sessionInfo.sessionTimeRemaining || (12 * 60 * 60 * 1000)) % (1000 * 60 * 60)) / (1000 * 60))} minutes
                        </span>
                      </div>
                    </>
                  )}
                  
                </div>
                
                {/* Only show the button if the session is not completed */}
                {!sessionInfo.sessionCompleted && (
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={() => {
                        // Continue with existing session
                        setSelectedQuestionType(sessionInfo.questionType);
                        setShowWelcome(false);
                        setShowSessionScreen(true);
                      }}
                      className="bg-[#e30f53] hover:bg-[#b50c43] text-white"
                    >
                      Continue Session
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
        
        {/* Register New Team Option */}
        <div className="mt-4 mb-8">
          <p className="text-gray-300 mb-2">Don't have a team code?</p>
          <Button 
            onClick={() => {
              setTeamCode("");
              setShowWelcome(false);
              setShowRegistration(true);
            }}
            variant="outline"
            className="border-[#e30f53] text-[#e30f53] hover:bg-[#e30f53] hover:text-white"
          >
            Register New Team
          </Button>
        </div>

        {/* Competition Info */}
        <div className="mt-10 sm:mt-16">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-4 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#e30f53] mr-2" />
              Competition Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm sm:text-base">
              <div className="space-y-2 sm:space-y-3">
                <p className="flex items-start">
                  <span className="text-[#e30f53] mr-2">•</span>
                  Teams must consist of 2 members minimum
                </p>
                <p className="flex items-start">
                  <span className="text-[#e30f53] mr-2">•</span>
                  All questions must be attempted with proper code submissions
                </p>
                <p className="flex items-start">
                  <span className="text-[#e30f53] mr-2">•</span>
                  Duplicate team registrations are not allowed
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <p className="flex items-start">
                  <span className="text-[#e30f53] mr-2">•</span>
                  Code must be original and properly documented
                </p>
                <p className="flex items-start">
                  <span className="text-[#e30f53] mr-2">•</span>
                  Submissions will be reviewed for authenticity
                </p>
                <p className="flex items-start">
                  <span className="text-[#e30f53] mr-2">•</span>
                  Session timer limits onboarding to 12 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
