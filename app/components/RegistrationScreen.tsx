"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";

interface MemberData {
  fullName: string;
  email: string;
  gender: "male" | "female" | "other" | "";
  foodPreference: "veg" | "non-veg" | "";
}

interface TeamData {
  teamName: string;
  members: MemberData[];
  phoneNumber: string;
}

interface TeamSession {
  teamCode: string;
  startTime: Date;
  endTime: Date | null;
  questionType: number | null;
  isCompleted: boolean;
  remainingTimeMs: number;
}

interface RegistrationScreenProps {
  teamData: TeamData;
  setTeamData: React.Dispatch<React.SetStateAction<TeamData>>;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRegistration: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSessionScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setTeamCode: React.Dispatch<React.SetStateAction<string>>;
  setSession: React.Dispatch<React.SetStateAction<TeamSession | null>>;
}

// Validate email function
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  teamData,
  setTeamData,
  setShowWelcome,
  setShowRegistration,
  setShowSessionScreen,
  setTeamCode,
  setSession,
}) => {
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [generatedTeamCode, setGeneratedTeamCode] = useState("");

  const updateMemberData = (index: number, field: keyof MemberData, value: string) => {
    const newMembers = [...teamData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setTeamData({
      ...teamData,
      members: newMembers,
    });
  };

  const validateRegistrationData = (): string[] => {
    const errors: string[] = [];
    
    if (!teamData.teamName.trim()) errors.push("Team name is required");
    if (!teamData.phoneNumber.trim()) errors.push("Phone number is required");
    
    // Check if at least 2 members have complete information
    const completeMembersCount = teamData.members.filter(member => 
      member.fullName.trim() && member.email.trim() && 
      member.gender !== "" && member.foodPreference !== "" && 
      validateEmail(member.email)
    ).length;
    
    if (completeMembersCount < 2) {
      errors.push("At least 2 members must have complete information");
    }
    
    // Check for valid emails in members
    teamData.members.forEach((member, index) => {
      if (member.email.trim() && !validateEmail(member.email)) {
        errors.push(`Member ${index + 1} has an invalid email address`);
      }
    });
    
    return errors;
  };

  // Function to get or start session
  const getOrStartSession = async (teamCode: string, questionType: number | null = null): Promise<{
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
        body: JSON.stringify({ teamCode, questionType }),
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

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegistrationData();
    
    if (validationErrors.length > 0) {
      setRegisterError(validationErrors.join(", "));
      return;
    }
    
    setRegistering(true);
    setRegisterError("");
    
    try {
      const response = await fetch("/api/register-team-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamData }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setRegisterError(data.error || "Registration failed");
      } else {
        setGeneratedTeamCode(data.teamCode);
        setRegisterSuccess("Team registered successfully!");
        
        // Auto set the team code for session
        setTeamCode(data.teamCode);
        
        // Wait 2 seconds then move to session start screen
        setTimeout(() => {
          setShowRegistration(false);
          setShowSessionScreen(true);
          
          // Start a new session
          getOrStartSession(data.teamCode).then((sessionResult) => {
            if (sessionResult.success && sessionResult.session) {
              setSession(sessionResult.session);
            }
          });
        }, 2000);
      }
    } catch (err) {
      setRegisterError("Network error occurred");
    } finally {
      setRegistering(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/duo_5.svg" alt="DUOTHAN 5.0" className="h-8 sm:h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Team Registration</h1>
          <p className="text-gray-300">Register your team for Duothan 5.0 Onboarding</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-4 sm:p-8 max-w-4xl mx-auto">
          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            {/* Team Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="w-5 h-5 text-[#e30f53] mr-2" />
                Team Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName" className="text-white text-sm mb-1 block">
                    Team Name*
                  </Label>
                  <Input
                    id="teamName"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData({...teamData, teamName: e.target.value})}
                    className="bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                    placeholder="Enter team name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phoneNumber" className="text-white text-sm mb-1 block">
                    Phone Number*
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={teamData.phoneNumber}
                    onChange={(e) => setTeamData({...teamData, phoneNumber: e.target.value})}
                    className="bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Team Members */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="w-5 h-5 text-[#e30f53] mr-2" />
                Team Members
                <span className="text-sm font-normal text-gray-400 ml-2">(Minimum 2 required)</span>
              </h2>
              
              {teamData.members.map((member, index) => (
                <div key={index} className="p-4 border border-gray-600 bg-white bg-opacity-5 rounded-md">
                  <h3 className="text-white font-medium mb-3">Member {index + 1}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`member-${index}-name`} className="text-gray-300 text-xs mb-1 block">
                        Full Name
                      </Label>
                      <Input
                        id={`member-${index}-name`}
                        value={member.fullName}
                        onChange={(e) => updateMemberData(index, 'fullName', e.target.value)}
                        className="bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-sm"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`member-${index}-email`} className="text-gray-300 text-xs mb-1 block">
                        Email
                      </Label>
                      <Input
                        id={`member-${index}-email`}
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMemberData(index, 'email', e.target.value)}
                        className="bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-sm"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <Label className="text-gray-300 text-xs mb-1 block">Gender</Label>
                      <div className="flex space-x-4 mt-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={member.gender === "male"}
                            onChange={() => updateMemberData(index, 'gender', 'male')}
                            className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                          />
                          <span className="text-white text-sm">Male</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={member.gender === "female"}
                            onChange={() => updateMemberData(index, 'gender', 'female')}
                            className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                          />
                          <span className="text-white text-sm">Female</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={member.gender === "other"}
                            onChange={() => updateMemberData(index, 'gender', 'other')}
                            className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                          />
                          <span className="text-white text-sm">Other</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-300 text-xs mb-1 block">Food Preference</Label>
                      <div className="flex space-x-4 mt-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={member.foodPreference === "veg"}
                            onChange={() => updateMemberData(index, 'foodPreference', 'veg')}
                            className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                          />
                          <span className="text-white text-sm">Vegetarian</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={member.foodPreference === "non-veg"}
                            onChange={() => updateMemberData(index, 'foodPreference', 'non-veg')}
                            className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                          />
                          <span className="text-white text-sm">Non-Vegetarian</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Error and Success Messages */}
            {registerError && (
              <Alert className="bg-red-500 bg-opacity-10 border-red-500 text-left">
                <AlertDescription className="text-red-400 text-sm">{registerError}</AlertDescription>
              </Alert>
            )}
            
            {registerSuccess && (
              <Alert className="bg-green-500 bg-opacity-10 border-green-500 text-left">
                <AlertDescription className="text-green-400 text-sm">
                  {registerSuccess} Your team code is: <span className="font-bold">{generatedTeamCode}</span>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                type="button"
                onClick={() => setShowWelcome(true)}
                className="bg-transparent border border-gray-400 text-gray-300 hover:border-white hover:text-white sm:flex-1"
              >
                Back to Home
              </Button>
              
              <Button 
                type="submit"
                disabled={registering}
                className="bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white sm:flex-1"
              >
                {registering ? "Registering..." : "Register Team"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
