"use client"

import { useState } from "react"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { RegistrationScreen } from "./components/RegistrationScreen" 
import { SessionScreen } from "./components/SessionScreen"
import { QuestionSelectionScreen } from "./components/QuestionSelectionScreen"

export default function TestPage() {
  const [activeComponent, setActiveComponent] = useState('welcome')
  const [teamCode, setTeamCode] = useState("")
  const [session, setSession] = useState(null)
  const [selectedQuestionType, setSelectedQuestionType] = useState(null)
  const [teamData, setTeamData] = useState({
    teamName: "",
    members: [
      { fullName: "", email: "", gender: "", foodPreference: "" },
      { fullName: "", email: "", gender: "", foodPreference: "" },
      { fullName: "", email: "", gender: "", foodPreference: "" },
      { fullName: "", email: "", gender: "", foodPreference: "" }
    ],
    phoneNumber: "",
  })
  
  return (
    <div className="min-h-screen bg-black text-white p-5">
      <h1 className="text-2xl font-bold mb-5">Component Tester</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button 
          onClick={() => setActiveComponent('welcome')}
          className={`p-2 ${activeComponent === 'welcome' ? 'bg-[#e30f53]' : 'bg-gray-700'} rounded`}
        >
          Welcome Screen
        </button>
        <button 
          onClick={() => setActiveComponent('registration')}
          className={`p-2 ${activeComponent === 'registration' ? 'bg-[#e30f53]' : 'bg-gray-700'} rounded`}
        >
          Registration Screen
        </button>
        <button 
          onClick={() => setActiveComponent('session')}
          className={`p-2 ${activeComponent === 'session' ? 'bg-[#e30f53]' : 'bg-gray-700'} rounded`}
        >
          Session Screen
        </button>
        <button 
          onClick={() => setActiveComponent('question')}
          className={`p-2 ${activeComponent === 'question' ? 'bg-[#e30f53]' : 'bg-gray-700'} rounded`}
        >
          Question Selection
        </button>
      </div>
      
      <div className="component-display border border-gray-700 rounded p-4">
        {activeComponent === 'welcome' && (
          <WelcomeScreen 
            teamCode={teamCode}
            setTeamCode={setTeamCode}
            setShowWelcome={val => !val && setActiveComponent('registration')}
            setShowRegistration={val => val && setActiveComponent('registration')}
            setShowQuestionSelector={val => val && setActiveComponent('question')}
            setShowSessionScreen={val => val && setActiveComponent('session')}
            setSession={setSession}
            setSelectedQuestionType={setSelectedQuestionType}
            setIsTeamCodeValid={() => {}}
          />
        )}
        
        {activeComponent === 'registration' && (
          <RegistrationScreen 
            teamData={teamData}
            setTeamData={setTeamData}
            setShowWelcome={val => val && setActiveComponent('welcome')}
            setShowRegistration={val => !val && setActiveComponent('welcome')}
            setShowSessionScreen={val => val && setActiveComponent('session')}
            setTeamCode={setTeamCode}
            setSession={setSession}
          />
        )}
        
        {activeComponent === 'session' && (
          <SessionScreen 
            session={{
              teamCode: teamCode || "DEMO123",
              startTime: new Date(),
              endTime: null,
              questionType: selectedQuestionType || 0,
              isCompleted: false,
              remainingTimeMs: 43200000
            }}
            setShowWelcome={val => val && setActiveComponent('welcome')}
            setShowSessionScreen={val => !val && setActiveComponent('welcome')}
            setShowQuestionSelector={val => val && setActiveComponent('question')}
          />
        )}
        
        {activeComponent === 'question' && (
          <QuestionSelectionScreen 
            setSelectedQuestionType={setSelectedQuestionType}
            setShowWelcome={val => val && setActiveComponent('welcome')}
            setShowQuestionSelector={val => !val && setActiveComponent('session')}
          />
        )}
      </div>
    </div>
  )
}
