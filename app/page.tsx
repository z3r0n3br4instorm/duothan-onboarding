"use client"

import { useState } from "react"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { RegistrationScreen } from "./components/RegistrationScreen"
import { SessionScreen } from "./components/SessionScreen"
import { QuestionSelectionScreen } from "./components/QuestionSelectionScreen"

interface MemberData {
  fullName: string
  email: string
  gender: "male" | "female" | "other" | ""
  foodPreference: "veg" | "non-veg" | ""
}

interface TeamData {
  teamName: string
  members: MemberData[]
  phoneNumber: string
}

interface TeamSession {
  teamCode: string
  startTime: Date
  endTime: Date | null
  questionType: number | null
  isCompleted: boolean
  remainingTimeMs: number
}

export default function DuothanOnboarding() {
  // Screen state
  const [showWelcome, setShowWelcome] = useState(true)
  const [showQuestionSelector, setShowQuestionSelector] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showSessionScreen, setShowSessionScreen] = useState(false)
  
  // Team code state
  const [teamCode, setTeamCode] = useState("")
  const [isTeamCodeValid, setIsTeamCodeValid] = useState(false)
  
  // Question selection state
  const [selectedQuestionType, setSelectedQuestionType] = useState<number | null>(null)
  
  // Team data state
  const [teamData, setTeamData] = useState<TeamData>({
    teamName: "",
    members: [
      { fullName: "", email: "", gender: "", foodPreference: "" },
      { fullName: "", email: "", gender: "", foodPreference: "" },
      { fullName: "", email: "", gender: "", foodPreference: "" },
      { fullName: "", email: "", gender: "", foodPreference: "" }
    ],
    phoneNumber: "",
  })
  
  // Session state
  const [session, setSession] = useState<TeamSession | null>(null)

  // Determine which screen to show based on state
  let currentScreen;
  if (showWelcome) {
    currentScreen = (
      <WelcomeScreen
        teamCode={teamCode}
        setTeamCode={setTeamCode}
        setShowWelcome={setShowWelcome}
        setShowRegistration={setShowRegistration}
        setShowQuestionSelector={setShowQuestionSelector}
        setShowSessionScreen={setShowSessionScreen}
        setSession={setSession}
        setSelectedQuestionType={setSelectedQuestionType}
        setIsTeamCodeValid={setIsTeamCodeValid}
      />
    );
  } else if (showRegistration) {
    currentScreen = (
      <RegistrationScreen
        teamData={teamData}
        setTeamData={setTeamData}
        setShowWelcome={setShowWelcome}
        setShowRegistration={setShowRegistration}
        setShowSessionScreen={setShowSessionScreen}
        setTeamCode={setTeamCode}
        setSession={setSession}
      />
    );
  } else if (showQuestionSelector) {
    currentScreen = (
      <QuestionSelectionScreen
        setSelectedQuestionType={setSelectedQuestionType}
        selectedQuestionType={selectedQuestionType}
        teamCode={teamCode}
        setShowWelcome={setShowWelcome}
        setShowQuestionSelector={setShowQuestionSelector}
        setShowSessionScreen={setShowSessionScreen}
        setSession={setSession}
      />
    );
  } else if (showSessionScreen && session) {
    currentScreen = (
      <SessionScreen
        session={session}
        setShowWelcome={setShowWelcome}
        setShowSessionScreen={setShowSessionScreen}
        setShowQuestionSelector={setShowQuestionSelector}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      {currentScreen}
    </div>
  )
}