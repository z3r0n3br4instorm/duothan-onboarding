"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Code, Cpu, Upload, ArrowRight, X, FileText, Zap, Check, Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface TeamSession {
  teamCode: string;
  startTime: Date;
  endTime: Date | null;
  questionType: number | null;
  isCompleted: boolean;
  remainingTimeMs: number;
}

interface QuestionSelectionScreenProps {
  setSelectedQuestionType: React.Dispatch<React.SetStateAction<number | null>>;
  selectedQuestionType?: number | null;
  teamCode?: string;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuestionSelector: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSessionScreen?: React.Dispatch<React.SetStateAction<boolean>>;
  setSession?: React.Dispatch<React.SetStateAction<TeamSession | null>>;
}

export const QuestionSelectionScreen: React.FC<QuestionSelectionScreenProps> = ({
  setSelectedQuestionType,
  selectedQuestionType,
  teamCode,
  setShowWelcome,
  setShowQuestionSelector,
  setShowSessionScreen,
  setSession
}) => {
  // Format time helper function
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get session time remaining
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [remainingTimeMs, setRemainingTimeMs] = useState<number>(0);
  
  // Steps management
  const [currentStep, setCurrentStep] = useState(0);
  
  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Submission completion dialog state
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [redirectTime, setRedirectTime] = useState(5);
  const [redirectButtonEnabled, setRedirectButtonEnabled] = useState(false);
  
  const getSteps = () => {
    if (selectedQuestionType === 0) return ["Basic Quantum Computing", "Team Registration"];
    if (selectedQuestionType === 1) return ["Machine Learning Challenge", "Team Registration"];
    if (selectedQuestionType === 2) return ["Lorenz Attractor Simulation", "Team Registration"];
    return ["Unknown", "Team Registration"];
  }
  
  const steps = getSteps();
  
  const questions = {
    0: {
      title: "Basic Quantum Computing",
      icon: <Cpu className="w-8 h-8" />,
      content: [
        "## Question set 1",
        "",
        "> Both questions are mandatory and the upload shuld be in .ipynb format",
        "",
        "1. Create a quantum toffoli (CCNOT) gate and generate a diagram of it. Use qiskit library for this purpose. Upload the Generated image and the code for review. *ONLY USE FOLLOWING GATES*:",
        "   • Hadamard (H)",
        "   • Controlled Not (CX)",
        "   • π/8 (T)",
        "   • T Dagger (tdg)",
        "",
        "2. Implement deutsch algorithm using qiskit library to obtain the balanced measurement. Run the simulation 1024 rounds and submit the code, and the generated graphs for review",
      ],
    },
    1: {
      title: "Machine Learning Challenge",
      icon: <Activity className="w-8 h-8" />,
      content: [
        "## Question 2",
        "",
        "> Uploaded file should be in .ipynb format",
        "",
        "1. Create a multi-layer perceptron Network with 784 input neurons and 10 output neurons for handwriting recognition. Use MNIST dataset for training and testing. Submit the code for review with the accuracy score that you achieved!",
      ],
    },
    2: {
      title: "Lorenz Attractor Simulation",
      icon: <Code className="w-8 h-8" />,
      content: [
        "## Question 3",
        "",
        "> Your code should generate the 2D image as well...",
        "",
        "1. Create a simulation of the Lorenz Attractor using any language. The simulation should be able to generate the following depiction of the attractor. Use 2D representation instead of 3D and take horizontal axis as X and vertical axis as Z.",
        "",
        "The output should be similar to this image:",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lorenz_attractor_yb.svg/330px-Lorenz_attractor_yb.svg.png",
      ],
    },
  }

  // Session state
  const [sessionData, setSessionData] = useState<TeamSession | null>(null);
  
  // Get session time remaining and session data
  useEffect(() => {
    const fetchSessionTime = async () => {
      if (teamCode) {
        try {
          // Get session data
          const response = await fetch("/api/onboarding-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamCode, questionType: null }),
          });
          
          const data = await response.json();
          if (data.success && data.session) {
            // Store the raw milliseconds for countdown calculations
            const remainingMs = data.session.remainingTimeMs;
            setRemainingTimeMs(remainingMs);
            setTimeRemaining(formatTime(remainingMs));
            setSessionData(data.session);
            
            // If the session is already completed, show the submitted state
            if (data.session.isCompleted) {
              setIsSubmitted(true);
            }
            
            // Also check if there's already a submission
            try {
              const submissionResponse = await fetch(`/api/check-submission?teamCode=${teamCode}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              });
              
              const submissionData = await submissionResponse.json();
              
              if (submissionData.success && (submissionData.hasSubmission || submissionData.sessionCompleted)) {
                setIsSubmitted(true);
                
                // If submission exists but session is not marked as completed,
                // update the session
                if (submissionData.hasSubmission && data.session && !data.session.isCompleted) {
                  // Update session to mark it as completed
                  try {
                    const updateResponse = await fetch("/api/onboarding-session", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                        teamCode, 
                        isCompleted: true 
                      }),
                    });
                    
                    const updateData = await updateResponse.json();
                    if (updateData.success && updateData.session) {
                      setSessionData(updateData.session);
                      
                      // Update parent session state if available
                      if (setSession) {
                        setSession(updateData.session);
                      }
                    }
                  } catch (updateErr) {
                    console.error("Error updating session completion status:", updateErr);
                  }
                }
              }
            } catch (submissionError) {
              console.error("Error checking submission status:", submissionError);
            }
          }
        } catch (error) {
          console.error("Error fetching session time:", error);
        }
      }
    };
    
    fetchSessionTime();
  }, [teamCode]);
  
  // Timer update effect
  useEffect(() => {
    // Only set up timer if we're not in a completed session
    if (sessionData?.isCompleted) {
      return;
    }
    
    // Update time every second
    const timer = setInterval(() => {
      setRemainingTimeMs(prevTime => {
        // Reduce time by 1 second (1000ms)
        const newTime = Math.max(0, prevTime - 1000);
        
        // Update formatted time
        setTimeRemaining(formatTime(newTime));
        
        // If time is up, check and update session status
        if (newTime <= -3 && teamCode && !sessionData?.isCompleted) {
          // Clear the interval
          clearInterval(timer);
          
          // Mark session as completed due to timeout
          fetch("/api/onboarding-session", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              teamCode, 
              isCompleted: true 
            }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success && data.session) {
              setSessionData(data.session);
              
              // Update parent session state if available
              if (setSession) {
                setSession(data.session);
              }
            }
          })
          .catch(error => {
            console.error("Error updating session after timeout:", error);
          });
        }
        
        return newTime;
      });
    }, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [teamCode, sessionData?.isCompleted, setSession]);

  // File handling functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files) {
      const filesArray = Array.from(event.dataTransfer.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle redirect to home page after submission
  const startRedirectTimer = () => {
    setRedirectTime(5);
    setRedirectButtonEnabled(false);
  };

  const handleSubmit = async ({ step }: { step: number }) => {
    setLoading(true);
    
    // Prevent double submissions by checking if we're already submitted or loading
    if (isSubmitted || sessionData?.isCompleted) {
      setLoading(false);
      return;
    }
    
    // Only proceed if we have a teamCode and files to upload
    if (!teamCode || uploadedFiles.length === 0) {
      setLoading(false);
      return;
    }
    
    try {
      // Create a FormData object to upload files
      const formData = new FormData();
      
      // Add files with their content
      for (const file of uploadedFiles) {
        formData.append('files', file);
      }
      
      // Add additional data
      formData.append('teamCode', teamCode);
      formData.append('explanation', explanation);
      formData.append('questionType', selectedQuestionType?.toString() || '');
      
      // Use the dedicated file upload endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update session to mark it as completed
        if (setSession) {
          const sessionResponse = await fetch("/api/onboarding-session", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              teamCode, 
              questionType: selectedQuestionType,
              isCompleted: true 
            }),
          });
          
          const sessionData = await sessionResponse.json();
          
          if (sessionData.success && sessionData.session) {
            // Update the session in parent component
            setSession(sessionData.session);
          }
        }
        
        setLoading(false);
        setIsSubmitted(true);
        
        // Show submission completed dialog with redirect
        setShowCompletionDialog(true);
        
        // Start redirect timer
        startRedirectTimer();
        
        // Move to next step if applicable
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        setLoading(false);
        console.error("Error saving submission:", data.error);
        
        // If the submission already exists, mark as submitted anyway
        if (data.error === "A submission already exists for this team") {
          setIsSubmitted(true);
          
          // Update session state if needed
          if (setSession && sessionData) {
            setSession({
              ...sessionData,
              isCompleted: true
            });
          }
          
          // Also update local session data
          if (sessionData) {
            setSessionData({
              ...sessionData,
              isCompleted: true
            });
          }
        } else {
          // Handle other errors by showing an alert
          alert(`Error: ${data.error || "Failed to save submission"}`);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting solution:", error);
      
      // Check if the submission actually went through despite the error
      try {
        const checkResponse = await fetch(`/api/check-submission?teamCode=${teamCode}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        const checkData = await checkResponse.json();
        
        if (checkData.success && checkData.hasSubmission) {
          // If we find that a submission exists, update UI accordingly
          setIsSubmitted(true);
          
          // Update session state if needed
          if (setSession && sessionData) {
            setSession({
              ...sessionData,
              isCompleted: true
            });
          }
          
          // Also update local session data
          if (sessionData) {
            setSessionData({
              ...sessionData,
              isCompleted: true
            });
          }
        } else {
          // Show error message
          alert("Error submitting your solution. Please try again or contact support.");
        }
      } catch (checkError) {
        // Show error message if we can't check submission status
        alert("Error submitting your solution. Please try again or contact support.");
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      {/* Submission Completed Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="bg-black border border-[#e30f53] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center text-white">
              <Check className="h-6 w-6 mr-2 text-green-500" />
              Submission Completed
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              Your solution has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-white text-center">Redirecting to home page in <span className="font-bold text-[#e30f53]">{redirectTime}</span> seconds...</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowWelcome(true);
                setShowQuestionSelector(false);
                setShowCompletionDialog(false);
              }}
              disabled={!redirectButtonEnabled}
              className={`w-full bg-[#e30f53] hover:bg-[#b50c43] text-white transition-all duration-200 ${
                !redirectButtonEnabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Home className="mr-2 h-4 w-4" />
              {redirectButtonEnabled ? "Go to Home Page" : `Please wait (${redirectTime}s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Time Remaining Display */}
      {(timeRemaining || remainingTimeMs > 0) && !sessionData?.isCompleted && (
        <div className="absolute top-5 left-5 bg-[#e30f53] bg-opacity-20 px-4 py-2 rounded-md z-20">
          <span className="text-white font-mono">Time Remaining: {timeRemaining || "00:00:00"}</span>
        </div>
      )}
      
      {/* Session Status Display */}
      {sessionData?.isCompleted && (
        <div className="absolute top-5 right-5 bg-green-600 bg-opacity-20 px-4 py-2 rounded-md z-20">
          <span className="text-white font-mono flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submission Complete
          </span>
        </div>
      )}
    
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {selectedQuestionType !== null ? (
          // Question Detail View
          <>
            {currentStep === 0 && selectedQuestionType !== null && (
              <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-4 sm:p-8 mb-0">
                <div className="flex flex-col sm:flex-row items-center mb-6 sm:mb-8 pb-4 border-b border-gray-700">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#e30f53] bg-opacity-20 flex items-center justify-center mb-3 sm:mb-0 sm:mr-5 rounded-md shadow-lg">
                    {questions[selectedQuestionType as keyof typeof questions].icon}
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white text-center sm:text-left">
                    {questions[selectedQuestionType as keyof typeof questions].title}
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  {questions[selectedQuestionType as keyof typeof questions].content.map((line, index) => {
                    // Style headers (## Heading)
                    if (line.startsWith('##')) {
                      return (
                        <div key={index} className="my-5">
                          <h3 className="text-2xl font-bold text-white inline-block relative">
                            {line.replace('##', '')}
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#e30f53]"></div>
                          </h3>
                        </div>
                      );
                    }
                    // Style quotes/callouts (> text)
                    else if (line.startsWith('>')) {
                      return (
                        <div key={index} className="my-5 rounded-md overflow-hidden shadow-md">
                          <div className="bg-[#e30f53] px-4 py-1.5 text-sm font-medium text-white">
                            IMPORTANT
                          </div>
                          <div className="bg-[#e30f53] bg-opacity-10 px-4 py-3 border-l-4 border-[#e30f53]">
                            {line.replace('>', '')}
                          </div>
                        </div>
                      );
                    }
                    // Style bullet points (• text)
                    else if (line.startsWith('   •')) {
                      return <p key={index} className="ml-6 text-[#e30f53] flex items-center gap-2">
                        <span className="text-xl">•</span>
                        <span>{line.replace('   •', '')}</span>
                      </p>;
                    }
                    // Style numbered list items (1. 2. etc)
                    else if (/^\d+\./.test(line)) {
                      const [number, ...rest] = line.split('.');
                      return (
                        <div key={index} className="flex items-start gap-3 mb-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e30f53] bg-opacity-20 text-[#e30f53] font-bold">
                            {number}
                          </span>
                          <p className="font-medium text-white">
                            {rest.join('.')}.
                          </p>
                        </div>
                      );
                    }
                    // Style code or emphasized text with asterisks
                    else if (line.includes('*') && !line.startsWith('   •')) {
                      const parts = line.split(/(\*[^*]+\*)/g);
                      return (
                        <p key={index} className="my-1">
                          {parts.map((part, i) => {
                            if (part.startsWith('*') && part.endsWith('*')) {
                              return <span key={i} className="font-semibold text-[#e30f53]">{part.slice(1, -1)}</span>;
                            }
                            return <span key={i}>{part}</span>;
                          })}
                        </p>
                      );
                    }
                    // Style URL links and images
                    else if (line.startsWith('http')) {
                      return <div key={index} className="my-4 flex flex-col items-center">
                        <img src={line} alt="Example output" className="max-w-full h-auto rounded-md border border-gray-600 shadow-lg" />
                        <p className="text-xs text-gray-400 mt-2">Example output image</p>
                      </div>;
                    }
                    // Default styling
                    return <p key={index} className={line.startsWith("   ") ? "ml-6 text-gray-400" : ""}>{line}</p>;
                  })}
                </div>

                {sessionData?.isCompleted && (
                  <div className="mt-6 mb-8 bg-green-600 bg-opacity-10 border border-green-500 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-green-500 font-medium text-lg mb-1">Session Complete</h4>
                        <p className="text-gray-300">
                          Your team has already completed and submitted this challenge. You cannot make further changes or submissions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 space-y-4">
                  <div>
                    <Label htmlFor="code-upload" className="text-white font-medium mb-2 block">
                      Upload Code Files
                    </Label>
                    <div 
                      className="border-2 border-dashed border-gray-600 hover:border-[#e30f53] transition-colors duration-300 p-3 sm:p-4 text-center bg-white bg-opacity-5 cursor-pointer"
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                      <p className="text-gray-300 mb-2 text-xs sm:text-sm">
                        {selectedQuestionType === 2 
                          ? "Drag and drop your code files here (.py, .js, .java, etc.)" 
                          : "Drag and drop your Jupyter Notebook (.ipynb) file here"}
                      </p>
                      <Button 
                        variant="outline" 
                        className="border-[#e30f53] text-[#e30f53] hover:bg-[#e30f53] hover:text-white text-xs sm:text-sm py-1 sm:py-2"
                        type="button"
                      >
                        Browse Files
                      </Button>
                      <input
                        id="file-input"
                        type="file"
                        multiple
                        accept={selectedQuestionType === 2 
                          ? ".py,.js,.java,.cpp,.c,.ipynb,.jl,.m,.r,.txt" 
                          : ".ipynb"}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    
                    {/* File List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 sm:mt-4 space-y-2">
                        <Label className="text-white font-medium">Uploaded Files:</Label>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white bg-opacity-5 p-2 sm:p-3 border border-gray-600">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#e30f53]" />
                              <div className="overflow-hidden">
                                <p className="text-white text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none">{file.name}</p>
                                <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-1 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ml-2"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="explanation" className="text-white font-medium mb-2 block">
                      Explanation & Approach
                    </Label>
                    <Textarea
                      id="explanation"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Explain your approach and methodology..."
                      className="min-h-24 sm:min-h-32 bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button 
                      onClick={() => {
                        setShowQuestionSelector(true);
                        setCurrentStep(0);
                        setSelectedQuestionType(null);
                      }}
                      className="bg-transparent border border-gray-400 text-gray-300 hover:border-white hover:text-white py-2 sm:py-3 text-sm sm:text-lg font-semibold transition-all duration-200 sm:flex-1 order-2 sm:order-1"
                    >
                      Back to Selection
                    </Button>
                    <Button 
                      onClick={() => handleSubmit({ step: currentStep })}
                      disabled={loading || uploadedFiles.length === 0 || !explanation.trim() || isSubmitted || sessionData?.isCompleted}
                      className={`sm:flex-1 py-2 sm:py-3 text-sm sm:text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${
                        isSubmitted || sessionData?.isCompleted
                          ? 'bg-green-600 hover:bg-green-600 text-white' 
                          : 'bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white'
                      }`}
                    >
                      {loading ? "Submitting..." : (isSubmitted || sessionData?.isCompleted) ? "Submitted" : "Submit Solution"}
                      {!(isSubmitted || sessionData?.isCompleted) && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Challenge Selection View
          <>
            {/* Main Title */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
                Select a Challenge
              </h1>
              <p className="text-gray-300 mb-6 sm:mb-8">
                Choose one challenge to work on:
              </p>
              
              {sessionData?.isCompleted && (
                <div className="mb-8 bg-yellow-600 bg-opacity-10 border border-yellow-500 rounded-md p-4 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="text-yellow-500 font-medium text-lg mb-1">Notice</h4>
                      <p className="text-gray-300">
                        Your team has already completed a submission. You can view your previous work, but you cannot submit again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Challenge Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 max-w-4xl mx-auto">
              <div 
                onClick={async () => {
                  setSelectedQuestionType(0);
                  
                  // If we have teamCode and setShowSessionScreen/setSession props
                  // Start session with the selected question type
                  if (teamCode && setShowSessionScreen && setSession) {
                    try {
                      // Use PUT method to update the question type and start session timer
                      const response = await fetch("/api/onboarding-session", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ teamCode, questionType: 0 }),
                      });
                      
                      const data = await response.json();
                      
                      if (data.success && data.session) {
                        setSession(data.session);
                        setShowQuestionSelector(false);
                        setShowSessionScreen(true);
                        return;
                      }
                    } catch (err) {
                      console.error("Error starting session:", err);
                    }
                  }
                  
                  // Default behavior if no session handling
                  setShowQuestionSelector(false);
                }}
                className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-5 sm:p-8 transition-all duration-500 hover:bg-opacity-10 hover:scale-105 cursor-pointer"
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#e30f53] bg-opacity-20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-[#e30f53]" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">Quantum Computing</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Design a quantum CCNOT (Toffoli) gate using only Hadamard, CX, T and T Dagger gates, and implement the Deutsch algorithm using the Qiskit library.
                </p>
              </div>

              <div 
                onClick={async () => {
                  setSelectedQuestionType(1);
                  
                  // If we have teamCode and setShowSessionScreen/setSession props
                  // Start session with the selected question type
                  if (teamCode && setShowSessionScreen && setSession) {
                    try {
                      // Use PUT method to update the question type and start session timer
                      const response = await fetch("/api/onboarding-session", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ teamCode, questionType: 1 }),
                      });
                      
                      const data = await response.json();
                      
                      if (data.success && data.session) {
                        setSession(data.session);
                        setShowQuestionSelector(false);
                        setShowSessionScreen(true);
                        return;
                      }
                    } catch (err) {
                      console.error("Error starting session:", err);
                    }
                  }
                  
                  // Default behavior if no session handling
                  setShowQuestionSelector(false);
                }}
                className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-5 sm:p-8 transition-all duration-500 hover:bg-opacity-10 hover:scale-105 cursor-pointer"
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#e30f53] bg-opacity-20 flex items-center justify-center">
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-[#e30f53]" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">Machine Learning</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Create a multi-layer perceptron network with 784 input neurons and 10 output neurons for handwriting recognition using the MNIST dataset.
                </p>
              </div>

              <div 
                onClick={async () => {
                  setSelectedQuestionType(2);
                  
                  // If we have teamCode and setShowSessionScreen/setSession props
                  // Start session with the selected question type
                  if (teamCode && setShowSessionScreen && setSession) {
                    try {
                      // Use PUT method to update the question type and start session timer
                      const response = await fetch("/api/onboarding-session", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ teamCode, questionType: 2 }),
                      });
                      
                      const data = await response.json();
                      
                      if (data.success && data.session) {
                        setSession(data.session);
                        setShowQuestionSelector(false);
                        setShowSessionScreen(true);
                        return;
                      }
                    } catch (err) {
                      console.error("Error starting session:", err);
                    }
                  }
                  
                  // Default behavior if no session handling
                  setShowQuestionSelector(false);
                }}
                className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-5 sm:p-8 transition-all duration-500 hover:bg-opacity-10 hover:scale-105 cursor-pointer"
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#e30f53] bg-opacity-20 flex items-center justify-center">
                    <Code className="w-6 h-6 sm:w-8 sm:h-8 text-[#e30f53]" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">Lorenz Attractor Simulation</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Create a 2D simulation of the Lorenz Attractor chaotic system using any language, mapping the X and Z coordinates to visualize the famous butterfly pattern.
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setShowWelcome(true)}
              className="bg-transparent border border-[#e30f53] text-[#e30f53] hover:bg-[#e30f53] hover:text-white px-6 sm:px-8 py-2 font-medium transition-all duration-200"
            >
              Back to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
