"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ArrowRight, Code, Cpu, Activity, Users, Trophy, Zap, X, FileText } from "lucide-react"

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
  "Indian Institute of Technology (IIT) Delhi",
  "Indian Institute of Technology (IIT) Bombay",
  "Indian Institute of Technology (IIT) Madras",
  "Indian Institute of Technology (IIT) Kanpur",
  "Indian Institute of Technology (IIT) Kharagpur",
  "Indian Institute of Technology (IIT) Roorkee",
  "Indian Institute of Technology (IIT) Guwahati",
  "Indian Institute of Technology (IIT) Hyderabad",
  "Indian Institute of Science (IISc) Bangalore",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "Indraprastha Institute of Information Technology (IIIT-D)",
  "Birla Institute of Technology and Science (BITS) Pilani",
  "Vellore Institute of Technology (VIT)",
  "Manipal Institute of Technology",
  "National Institute of Technology (NIT) Trichy",
  "National Institute of Technology (NIT) Warangal",
  "National Institute of Technology (NIT) Surathkal",
  "Jadavpur University",
  "Anna University",
  "University of Delhi",
  "Jamia Millia Islamia",
  "Aligarh Muslim University",
  "Banaras Hindu University",
  "Other"
]

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function DuothanRegistration() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
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

  useEffect(() => {
    setAnimationDelay(0)
    // Reset form data when step changes
    setUploadedFiles([])
    setExplanation("")
    setIsSubmitted(false)
  }, [currentStep])

  const steps = ["Quantum Computing", "Machine Learning", "Lorenz Attractor", "Team Registration"]

  const questions = {
    0: {
      title: "Basic Quantum Computing",
      icon: <Cpu className="w-8 h-8" />,
      content: [
        "1. Create a quantum toffoli (CCNOT) gate and generate a diagram of it. Use qiskit library for this purpose. Upload the Generated image and the code for review. *ONLY USE FOLLOWING GATES*:",
        "   • Hadamard H",
        "   • Controlled Not (CX)",
        "   • π/8 (T)",
        "   • T Dagger",
        "",
        "2. Implement deutsch algorithm using qiskit library to obtain the balanced measurement. Run the simulation 1024 rounds and submit the code, and the generated graphs for review",
      ],
    },
    1: {
      title: "Machine Learning Challenge",
      icon: <Activity className="w-8 h-8" />,
      content: [
        "1. Implement a neural network from scratch (without using high-level frameworks like TensorFlow or PyTorch) to classify handwritten digits from the MNIST dataset.",
        "",
        "Requirements:",
        "   • Use only NumPy for mathematical operations",
        "   • Implement backpropagation algorithm",
        "   • Achieve at least 85% accuracy on test set",
        "   • Include training loss and accuracy plots",
        "",
        "2. Submit your complete code, training plots, and a brief explanation of your implementation approach.",
      ],
    },
    2: {
      title: "Lorenz Attractor Visualization",
      icon: <Code className="w-8 h-8" />,
      content: [
        "1. Create an interactive 3D visualization of the Lorenz Attractor system using Python.",
        "",
        "Requirements:",
        "   • Solve the Lorenz differential equations numerically",
        "   • Create an animated 3D plot showing the trajectory",
        "   • Allow users to modify parameters (σ, ρ, β) interactively",
        "   • Include phase space analysis",
        "",
        "2. Bonus: Add bifurcation diagram analysis for varying ρ values",
        "",
        "Submit your code, visualization outputs, and analysis documentation.",
      ],
    },
  }

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Main Title */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold mt-4 mb-2 bg-gradient-to-r from-white via-[#e30f53] to-white bg-clip-text text-transparent">
            DUOTHAN 5.0
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Onboarding
          </p>
        </div>

        {/* Challenge Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-8 transition-all duration-500 hover:bg-opacity-10 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#e30f53] bg-opacity-20 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-[#e30f53]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Quantum Computing</h3>
            {/* <p className="text-gray-300 text-sm leading-relaxed">
              Dive into quantum algorithms and create quantum gates using Qiskit. Build Toffoli gates and implement Deutsch's algorithm.
            </p> */}
          </div>

          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-8 transition-all duration-500 hover:bg-opacity-10 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#e30f53] bg-opacity-20 flex items-center justify-center">
                <Activity className="w-8 h-8 text-[#e30f53]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Machine Learning</h3>
            {/* <p className="text-gray-300 text-sm leading-relaxed">
              Build neural networks from scratch using only NumPy. Implement backpropagation and achieve high accuracy on MNIST.
            </p> */}
          </div>

          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-8 transition-all duration-500 hover:bg-opacity-10 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#e30f53] bg-opacity-20 flex items-center justify-center">
                <Code className="w-8 h-8 text-[#e30f53]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Simulations</h3>
            {/* <p className="text-gray-300 text-sm leading-relaxed">
              Create stunning 3D visualizations of chaotic systems. Build interactive plots and analyze phase space dynamics.
            </p> */}
          </div>
        </div>

        {/* Call to Action */}
        <div>
          <Button 
            onClick={() => setShowWelcome(false)}
            className="bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white px-12 py-4 text-lg font-semibold transition-all duration-200 shadow-lg"
          >
            Begin Challenge
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Competition Info */}
        <div className="mt-16">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#e30f53] mr-2" />
              Competition Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div className="space-y-3">
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
              <div className="space-y-3">
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
      setUploadedFiles(prev => [...prev, ...newFiles])
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

    // For question steps (0-2), validate files and explanation
    if (currentStep < 3 && (uploadedFiles.length === 0 || !explanation.trim())) {
      setError("Please upload code files and provide an explanation")
      setLoading(false)
      return
    }

    // For team registration step (3), validate team data
    if (currentStep === 3 && (!teamData.teamName || !teamData.teamEmail)) {
      setError("Please fill in team name and email")
      setLoading(false)
      return
    }

    try {
      let submissionData
      
      if (currentStep < 3) {
        // For question steps, save the submission locally and move to next step
        submissionData = {
          step: currentStep,
          questionTitle: questions[currentStep as keyof typeof questions].title,
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
            setCurrentStep(0)
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

  if (showWelcome) {
    return <WelcomeScreen />
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e30f53] opacity-10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e30f53] opacity-5 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-8xl mx-auto p-6">
        {/* Progress Indicator */}
        <div className="mb-3">
          <div className="flex justify-center items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-12 h-12 flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                  ${index <= currentStep 
                    ? 'bg-[#e30f53] border-[#e30f53] text-white' 
                    : 'bg-transparent border-gray-600 text-gray-400'
                  }
                `}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                    index < currentStep ? 'bg-[#e30f53]' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <span className="text-gray-300 text-sm">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </span>
          </div>
        </div>

        {/* Question Content */}
        {currentStep < 3 && (
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-8 mb-0">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-[#e30f53] bg-opacity-20 flex items-center justify-center mr-4">
                {questions[currentStep as keyof typeof questions].icon}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {questions[currentStep as keyof typeof questions].title}
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              {questions[currentStep as keyof typeof questions].content.map((line, index) => (
                <p key={index} className={line.startsWith("   ") ? "ml-6 text-[#e30f53]" : ""}>
                  {line}
                </p>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <Label htmlFor="code-upload" className="text-white font-medium mb-2 block">
                  Upload Code Files
                </Label>
                <div 
                  className="border-2 border-dashed border-gray-600 hover:border-[#e30f53] transition-colors duration-300 p-4 text-center bg-white bg-opacity-5 cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drag and drop your code files here</p>
                  <Button 
                    variant="outline" 
                    className="border-[#e30f53] text-[#e30f53] hover:bg-[#e30f53] hover:text-white"
                    type="button"
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.html,.css,.sql,.ipynb,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-white font-medium">Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white bg-opacity-5 p-3 border border-gray-600">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-[#e30f53]" />
                          <div>
                            <p className="text-white text-sm font-medium">{file.name}</p>
                            <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-1 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
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
                  className="min-h-32 bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                />
              </div>

              <Button 
                onClick={() => handleSubmit({ step: currentStep })}
                disabled={loading || uploadedFiles.length === 0 || !explanation.trim() || isSubmitted}
                className={`w-full py-3 text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSubmitted 
                    ? 'bg-green-600 hover:bg-green-600 text-white' 
                    : 'bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white'
                }`}
              >
                {loading ? "Submitting..." : isSubmitted ? "Submitted" : "Submit Solution"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Team Registration */}
        {currentStep === 3 && (
          <div className="bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10 p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-[#e30f53] bg-opacity-20 flex items-center justify-center mr-4">
                <Users className="w-8 h-8 text-[#e30f53]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Team Registration</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="teamName" className="text-white font-medium mb-2 block">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData({...teamData, teamName: e.target.value})}
                    className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                    placeholder="Enter team name"
                  />
                </div>

                <div>
                  <Label htmlFor="teamEmail" className="text-white font-medium mb-2 block">
                    Team Email
                  </Label>
                  <Input
                    id="teamEmail"
                    type="email"
                    value={teamData.teamEmail}
                    onChange={(e) => setTeamData({...teamData, teamEmail: e.target.value})}
                    className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                    placeholder="team@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactNumber" className="text-white font-medium mb-2 block">
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  value={teamData.contactNumber}
                  onChange={(e) => setTeamData({...teamData, contactNumber: e.target.value})}
                  className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <Label htmlFor="university" className="text-white font-medium mb-2 block">
                  University/Institution
                </Label>
                <select
                  id="university"
                  value={teamData.university}
                  onChange={(e) => setTeamData({...teamData, university: e.target.value})}
                  className="w-full bg-white bg-opacity-5 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-[#e30f53] focus:ring-[#e30f53] focus:outline-none"
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
                <Label className="text-white font-medium mb-4 block">Team Members (4 members required)</Label>
                
                {teamData.members.map((member, index) => (
                  <div key={index} className="mb-6 p-4 border border-gray-600 rounded-lg bg-white bg-opacity-5">
                    <h4 className="text-white font-medium mb-3">Member {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-sm mb-1 block">Full Name</Label>
                        <Input
                          value={member.fullName}
                          onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                          placeholder="Enter full name"
                          className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white text-sm mb-1 block">Email Address</Label>
                        <Input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateMember(index, 'email', e.target.value)}
                          placeholder="Enter email address"
                          className="bg-white bg-opacity-5 border-gray-600 text-white placeholder-gray-400 focus:border-[#e30f53] focus:ring-[#e30f53]"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Label className="text-white text-sm mb-2 block">Food Preference</Label>
                      <div className="flex gap-4">
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
                <Alert className="mb-4 border-red-500 bg-red-500 bg-opacity-10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
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
                className="w-full bg-[#e30f53] hover:bg-[#b50c43] active:bg-white active:text-[#e30f53] text-white py-3 text-lg font-semibold transition-all duration-200"
              >
                {loading ? "Registering..." : "Complete Registration"}
                <Trophy className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Registration Completion Popup */}
        {showCompletionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 p-8 rounded-lg text-center max-w-md mx-4">
              <div className="w-16 h-16 bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-6 rounded-full">
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Registration Completed!</h3>
              <p className="text-gray-300 mb-4">
                Your team has been successfully registered for Duothan 5.0.
              </p>
              <p className="text-gray-400 text-sm">
                Redirecting to home screen...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}