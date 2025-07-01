"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ArrowRight, Code, Cpu, Activity, Users, Trophy, Zap, X, FileText, Menu, ChevronLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface MemberData {
  fullName: string
  email: string
  foodChoice: "veg" | "non-veg" | ""
}

interface TeamData {
  teamName: string
  teamEmail: string
  members: MemberData[]
  contactNumber: string
  university: string
}

// University list for dropdown
const universities = [
  "University of Peradeniya (UOP)",
  "University of Moratuwa (UOM)",
  "University of Ruhuna (UOR)",
  "Sri Lanka Institute of Information Technology (SLIIT)",
  "General Sir John Kotelawala Defence University (KDU)",
  "Wayamba University of Sri Lanka (WUSL)",
  "University of Colombo (UOC)",
  "Informatics Institute of Technology (IIT)",
  "Uva Wellassa University (UWU)",
  "Sabaragamuwa University of Sri Lanka (SUSL)",
  "Open University of Sri Lanka (OUSL)",
  "University of Kelaniya (UOK)",
  "National School of Business  Management (NSBM)",
  "University of Sri Jayewardenepura (USJP)",
  "Sri Lanka Technological Campus (SLTC)",
  "Rajarata University of Sri Lanka (RUSL)",
  "University of Vavuniya (UOV)",
  "University of Jaffna (UOJ)",
  "University of Vocational Technology (UOVT)",
  "South Eastern University of Sri Lanka (SEUSL)",
  "National Institute of Business Management (NIBM)",
  "Other"
]

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function DuothanRegistration() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showQuestionSelector, setShowQuestionSelector] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedQuestionType, setSelectedQuestionType] = useState<number | null>(null)
  const [teamData, setTeamData] = useState<TeamData>({
    teamName: "",
    teamEmail: "",
    members: [
      { fullName: "", email: "", foodChoice: "" },
      { fullName: "", email: "", foodChoice: "" },
      { fullName: "", email: "", foodChoice: "" },
      { fullName: "", email: "", foodChoice: "" }
    ],
    contactNumber: "",
    university: "",
  })
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [animationDelay, setAnimationDelay] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [explanation, setExplanation] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isMobile = useIsMobile()

  useEffect(() => {
    setAnimationDelay(0)
    // Reset form data when step changes
    setUploadedFiles([])
    setExplanation("")
    setIsSubmitted(false)
  }, [currentStep])

  const getSteps = () => {
    if (selectedQuestionType === 0) return ["Basic Quantum Computing", "Team Registration"];
    if (selectedQuestionType === 1) return ["Machine Learning Challenge", "Team Registration"];
    if (selectedQuestionType === 2) return ["Lorenz Attractor Simulation", "Team Registration"];
    return ["Unknown", "Team Registration"];
  }
  
  const steps = getSteps()

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

  const WelcomeScreen = () => (
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

        {/* Call to Action */}
        <div>
          <Button 
            onClick={() => {
              setShowWelcome(false)
              setShowQuestionSelector(true)
            }}
            className="bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white px-6 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg"
          >
            Initialize Onbording Sequance
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
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
                  Follow the specific requirements for each question
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Member update functions
  const updateMember = (index: number, field: keyof MemberData, value: string) => {
    const newMembers = [...teamData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setTeamData({
      ...teamData,
      members: newMembers,
    })
  }

  // Validation functions
  const validateTeamData = (): string[] => {
    const errors: string[] = []
    
    if (!teamData.teamName.trim()) errors.push("Team name is required")
    if (!teamData.teamEmail.trim()) errors.push("Team email is required")
    if (!isValidEmail(teamData.teamEmail)) errors.push("Please enter a valid team email")
    if (!teamData.contactNumber.trim()) errors.push("Contact number is required")
    if (!teamData.university) errors.push("Please select a university")
    
    // Check if at least 2 members have complete information
    const completeMembersCount = teamData.members.filter(member => 
      member.fullName.trim() && member.email.trim() && member.foodChoice && isValidEmail(member.email)
    ).length
    
    if (completeMembersCount < 2) {
      errors.push("At least 2 members must have complete information (name, email, food choice)")
    }
    
    // Check for valid emails in members
    teamData.members.forEach((member, index) => {
      if (member.email.trim() && !isValidEmail(member.email)) {
        errors.push(`Member ${index + 1} has an invalid email address`)
      }
    })
    
    return errors
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files) {
      const newFiles = Array.from(files)
      
      // Filter files based on question type
      const filteredFiles = selectedQuestionType === 2 
        ? newFiles // Accept any file type for Question 3 (Lorenz Attractor)
        : newFiles.filter(file => file.name.toLowerCase().endsWith('.ipynb')) // Only .ipynb for other questions
      
      if (filteredFiles.length < newFiles.length && selectedQuestionType !== 2) {
        setError("Only .ipynb files are accepted for this question")
        setTimeout(() => setError(""), 3000)
      }
      
      setUploadedFiles(prev => [...prev, ...filteredFiles])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (questionData: any) => {
    setLoading(true)
    setError("")
    setSuccess("")

    // For question step (0), validate files and explanation
    if (currentStep === 0 && (uploadedFiles.length === 0 || !explanation.trim())) {
      setError("Please upload code files and provide an explanation")
      setLoading(false)
      return
    }

    // For team registration step (1), validate team data
    if (currentStep === 1 && (!teamData.teamName || !teamData.teamEmail)) {
      setError("Please fill in team name and email")
      setLoading(false)
      return
    }

    try {
      let submissionData
      
      if (currentStep === 0 && selectedQuestionType !== null) {
        // For question step, save the submission locally and move to next step
        submissionData = {
          questionType: selectedQuestionType,
          questionTitle: questions[selectedQuestionType as keyof typeof questions].title,
          files: uploadedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
          })),
          explanation: explanation,
          timestamp: new Date().toISOString()
        }
        
        // Save submission locally and move to next step
        const newSubmissions = [...submissions, submissionData]
        setSubmissions(newSubmissions)
        setIsSubmitted(true)
        
        setTimeout(() => {
          setCurrentStep(currentStep + 1)
        }, 2000)
      } else {
        // For final step, submit everything to the API
        const response = await fetch("/api/register-team", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamData,
            submissions: submissions,
            completedAt: new Date().toISOString()
          }),
        })

        if (response.ok) {
          setSuccess("Team registration completed successfully!")
          setShowCompletionPopup(true)
          
          // Auto redirect to home screen after 3 seconds
          setTimeout(() => {
            setShowCompletionPopup(false)
            setShowWelcome(true)
            setShowQuestionSelector(false)
            setCurrentStep(0)
            setSelectedQuestionType(null)
            // Reset all form data
            setTeamData({
              teamName: "",
              teamEmail: "",
              members: [
                { fullName: "", email: "", foodChoice: "" },
                { fullName: "", email: "", foodChoice: "" },
                { fullName: "", email: "", foodChoice: "" },
                { fullName: "", email: "", foodChoice: "" }
              ],
              contactNumber: "",
              university: "",
            })
            setSubmissions([])
            setError("")
            setSuccess("")
          }, 3000)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Registration failed")
        }
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Question Selection Screen Component
  const QuestionSelectionScreen = () => (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Main Title */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
            Select a Challenge
          </h1>
          <p className="text-gray-300 mb-6 sm:mb-8">
            Choose one challenge to work on:
          </p>
        </div>

        {/* Challenge Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 max-w-4xl mx-auto">
          <div 
            onClick={() => {
              setSelectedQuestionType(0)
              setShowQuestionSelector(false)
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
            onClick={() => {
              setSelectedQuestionType(1)
              setShowQuestionSelector(false)
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
            onClick={() => {
              setSelectedQuestionType(2)
              setShowQuestionSelector(false)
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
      </div>
    </div>
  );

  // Mobile navigation button
  const MobileNavButton = () => {
    if (!isMobile || showWelcome || showQuestionSelector) return null
    
    return (
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed bottom-6 right-6 bg-[#e30f53] text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center sm:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>
    )
  }

  // Mobile menu
  const MobileMenu = () => {
    if (!mobileMenuOpen || !isMobile) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col sm:hidden">
        <div className="bg-[#1a1a1a] p-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
            <h2 className="text-lg font-bold text-white">Navigation</h2>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowWelcome(true)
                setShowQuestionSelector(false)
                setMobileMenuOpen(false)
              }}
              className="w-full bg-transparent text-left border border-gray-700 p-3 text-white flex items-center text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to Welcome
            </button>
            
            <button
              onClick={() => {
                setShowQuestionSelector(true)
                setCurrentStep(0)
                setSelectedQuestionType(null)
                setMobileMenuOpen(false)
              }}
              className="w-full bg-transparent text-left border border-gray-700 p-3 text-white flex items-center text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to Question Selection
            </button>
            
            {selectedQuestionType !== null && (
              <>
                <div className="border-t border-gray-800 my-3 pt-3">
                  <h3 className="text-gray-400 text-sm mb-2">Current Question</h3>
                  <div className="bg-[#e30f53] bg-opacity-10 p-3">
                    <p className="text-white text-sm font-medium">
                      {selectedQuestionType === 0 && "Quantum Computing"}
                      {selectedQuestionType === 1 && "Machine Learning"}
                      {selectedQuestionType === 2 && "Lorenz Attractor"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Determine which screen to show
  if (showWelcome) {
    return <WelcomeScreen />
  }
  
  if (showQuestionSelector) {
    return <QuestionSelectionScreen />
  }

  return (
    <>
      {/* Render the mobile navigation button and menu */}
      <MobileNavButton />
      <MobileMenu />
      
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-8xl mx-auto p-4 sm:p-6">
          {/* Progress Indicator */}
          <div className="mb-3">
            <div className="flex justify-center items-center space-x-2 sm:space-x-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`
                    w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all duration-300
                    ${index <= currentStep 
                      ? 'bg-[#e30f53] border-[#e30f53] text-white' 
                      : 'bg-transparent border-gray-600 text-gray-400'
                    }
                  `}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                      index < currentStep ? 'bg-[#e30f53]' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-2 sm:mt-4">
              <span className="text-gray-300 text-xs sm:text-sm">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
              </span>
            </div>
          </div>

          {/* Question Content */}
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
                    disabled={loading || uploadedFiles.length === 0 || !explanation.trim() || isSubmitted}
                    className={`sm:flex-1 py-2 sm:py-3 text-sm sm:text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${
                      isSubmitted 
                        ? 'bg-green-600 hover:bg-green-600 text-white' 
                        : 'bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white'
                    }`}
                  >
                    {loading ? "Submitting..." : isSubmitted ? "Submitted" : "Submit Solution"}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Team Registration */}
          {currentStep === 1 && (
            <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center mb-6 sm:mb-8">
                <div className="w-12 h-12 bg-[#e30f53] bg-opacity-20 flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#e30f53]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Team Registration</h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="teamName" className="text-white font-medium mb-1 sm:mb-2 block">
                      Team Name
                    </Label>
                    <Input
                      id="teamName"
                      value={teamData.teamName}
                      onChange={(e) => setTeamData({...teamData, teamName: e.target.value})}
                      className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-sm sm:text-base"
                      placeholder="Enter team name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamEmail" className="text-white font-medium mb-1 sm:mb-2 block">
                      Team Email
                    </Label>
                    <Input
                      id="teamEmail"
                      type="email"
                      value={teamData.teamEmail}
                      onChange={(e) => setTeamData({...teamData, teamEmail: e.target.value})}
                      className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-sm sm:text-base"
                      placeholder="team@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactNumber" className="text-white font-medium mb-1 sm:mb-2 block">
                    Contact Number
                  </Label>
                  <Input
                    id="contactNumber"
                    value={teamData.contactNumber}
                    onChange={(e) => setTeamData({...teamData, contactNumber: e.target.value})}
                    className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-sm sm:text-base"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="university" className="text-white font-medium mb-1 sm:mb-2 block">
                    University/Institution
                  </Label>
                  <select
                    id="university"
                    value={teamData.university}
                    onChange={(e) => setTeamData({...teamData, university: e.target.value})}
                    className="w-full bg-white bg-opacity-5 border border-gray-600 rounded-md px-3 py-1.5 sm:py-2 text-white focus:border-[#e30f53] focus:ring-[#e30f53] focus:outline-none text-sm sm:text-base"
                  >
                    <option value="" className="bg-black text-white">Select your university</option>
                    {universities.map((uni, index) => (
                      <option key={index} value={uni} className="bg-black text-white">
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-white font-medium mb-3 sm:mb-4 block">Team Members (4 members required)</Label>
                  
                  {teamData.members.map((member, index) => (
                    <div key={index} className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-600 rounded-lg bg-white bg-opacity-5">
                      <h4 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Member {index + 1}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-white text-xs sm:text-sm mb-1 block">Full Name</Label>
                          <Input
                            value={member.fullName}
                            onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                            placeholder="Enter full name"
                            className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-xs sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-white text-xs sm:text-sm mb-1 block">Email Address</Label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            placeholder="Enter email address"
                            className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53] text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:mt-3">
                        <Label className="text-white text-xs sm:text-sm mb-1 sm:mb-2 block">Food Preference</Label>
                        <div className="flex gap-4 text-xs sm:text-sm">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`food-${index}`}
                              value="veg"
                              checked={member.foodChoice === "veg"}
                              onChange={(e) => updateMember(index, 'foodChoice', e.target.value)}
                              className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                            />
                            <span className="text-white">Vegetarian</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`food-${index}`}
                              value="non-veg"
                              checked={member.foodChoice === "non-veg"}
                              onChange={(e) => updateMember(index, 'foodChoice', e.target.value)}
                              className="mr-2 text-[#e30f53] focus:ring-[#e30f53]"
                            />
                            <span className="text-white">Non-Vegetarian</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Error message above the button */}
                {error && (
                  <Alert className="mb-3 sm:mb-4 border-red-500 bg-red-500 bg-opacity-10">
                    <AlertDescription className="text-red-400 text-xs sm:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={() => {
                    const validationErrors = validateTeamData()
                    if (validationErrors.length > 0) {
                      setError(validationErrors.join(", "))
                      return
                    }
                    setError("")
                    handleSubmit(teamData)
                  }}
                  disabled={loading}
                  className="w-full bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white py-2 sm:py-3 text-sm sm:text-lg font-semibold transition-all duration-200"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                  <Trophy className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Registration Completion Popup */}
          {showCompletionPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 p-5 sm:p-8 rounded-lg text-center max-w-xs sm:max-w-md mx-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 rounded-full">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Registration Completed!</h3>
                <div className="flex justify-center my-3 sm:my-4">
                  <img src="/duo_5.svg" alt="DUOTHAN 5.0" className="h-6 sm:h-8" />
                </div>
                <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                  Your team has been successfully registered.
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Redirecting to home screen...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}