"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, User, Building2, Phone, Mail, ClipboardList, Target } from "lucide-react"

type SalesRep = {
  id: number
  name: string
  slug: string
  email: string
  phone: string
  title: string
}

type Question = {
  id: string
  text: string
}

type ToolStep = {
  toolKey: string
  toolName: string
  questions: Question[]
}

const TOOL_STEPS: ToolStep[] = [
  {
    toolKey: "title-profile",
    toolName: "Title Profile",
    questions: [
      { id: "q1", text: "Do you know how to access Title Profile?" },
      { id: "q2", text: "Do you know how to set up clients to receive profiles or alerts?" },
      { id: "q3", text: "Can you run property profiles?" },
      { id: "q4", text: "Can you explain profile sections to a client?" },
      { id: "q5", text: "Can you search by APN, owner, or address?" },
    ],
  },
  {
    toolKey: "title-toolbox",
    toolName: "Title Tool Box",
    questions: [
      { id: "q1", text: "Know how to log in / access" },
      { id: "q2", text: "Know how to create a client farm" },
      { id: "q3", text: "Know how to set up client saved searches" },
      { id: "q4", text: "Can create farm lists" },
      { id: "q5", text: "Can build targeted lists (NOD, equity, absentee, etc.)" },
      { id: "q6", text: "Can export lists" },
    ],
  },
  {
    toolKey: "pacific-agent-one",
    toolName: "Pacific Agent ONE",
    questions: [
      { id: "q1", text: "Know how to access & install the app" },
      { id: "q2", text: "Know how to add clients into the app" },
      { id: "q3", text: "Know how to brand the app with their info" },
      { id: "q4", text: "Can generate seller net sheets & buyer estimates" },
      { id: "q5", text: "Can share branded live net sheets with clients" },
    ],
  },
  {
    toolKey: "pct-smart-direct",
    toolName: "PCT Smart Direct",
    questions: [
      { id: "q1", text: "Know how to access Smart Direct" },
      { id: "q2", text: "Can set up new client campaigns" },
      { id: "q3", text: "Can create mailing lists" },
      { id: "q4", text: "Can generate postcards" },
      { id: "q5", text: "Can filter properly (distress, equity, absentee, etc.)" },
    ],
  },
  {
    toolKey: "pct-website",
    toolName: "PCT Website",
    questions: [
      { id: "q1", text: "Know how to navigate the website" },
      { id: "q2", text: "Know how to set up clients with tools or resources" },
      { id: "q3", text: "Can find all available resources" },
      { id: "q4", text: "Can guide clients through the site" },
    ],
  },
  {
    toolKey: "trainings",
    toolName: "Trainings Offered by PCT",
    questions: [
      { id: "q1", text: "Know what trainings are available" },
      { id: "q2", text: "Know how to access training schedules" },
      { id: "q3", text: "Know how to enroll clients in trainings" },
      { id: "q4", text: "Know how to leverage training content" },
    ],
  },
  {
    toolKey: "sales-dashboard",
    toolName: "Sales Dashboard",
    questions: [
      { id: "q1", text: "Do you know how to access your PCT Sales Dashboard?" },
      { id: "q2", text: "Do you know how to read your numbers?" },
      { id: "q3", text: "Are you checking weekly? (Sales Units, Refi Units, Revenue, Pipeline, etc.)" },
      { id: "q4", text: "Do you know how to track personal goals, monthly targets, etc.?" },
    ],
  },
]

const CONFIDENCE_CATEGORIES = [
  { key: "awareness", label: "Awareness" },
  { key: "access", label: "Know How to Access" },
  { key: "setup", label: "Know How to Setup" },
  { key: "usage", label: "Usage" },
  { key: "needTraining", label: "Need Training" },
]

const NEEDS_OPTIONS = [
  { key: "titleSearch", label: "Title Search & Examination" },
  { key: "escrowServices", label: "Escrow Services" },
  { key: "propertyProfiles", label: "Property Profiles & Reports" },
  { key: "farmLists", label: "Farm Lists & Targeted Marketing" },
  { key: "directMail", label: "Direct Mail Campaigns" },
  { key: "mobileApp", label: "Mobile App (Pacific Agent ONE)" },
  { key: "training", label: "Training & Education" },
]

const TIMELINE_OPTIONS = [
  "Immediately",
  "Within 1 month",
  "Within 3 months",
  "Within 6 months",
  "Just exploring options"
]

export default function ClientSurveyWizard() {
  const params = useParams()
  const slug = params.slug as string

  // Sales rep info
  const [salesRep, setSalesRep] = useState<SalesRep | null>(null)
  const [repLoading, setRepLoading] = useState(true)
  const [repError, setRepError] = useState<string | null>(null)

  // Client info
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientCompany, setClientCompany] = useState("")

  // Needs assessment
  const [needsAssessment, setNeedsAssessment] = useState<Record<string, boolean>>({})
  const [needsOther, setNeedsOther] = useState("")
  const [timeline, setTimeline] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Tool responses
  const [responses, setResponses] = useState<Record<string, Record<string, boolean>>>({
    "title-profile": {},
    "title-toolbox": {},
    "pacific-agent-one": {},
    "pct-smart-direct": {},
    "pct-website": {},
    trainings: {},
    "sales-dashboard": {},
  })

  // Confidence ratings
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, Record<string, number>>>({})

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [scores, setScores] = useState<{ capability: number; confidence: string } | null>(null)

  // Total steps: 0=client info, 1=needs, 2-8=tools, 9=confidence, 10=review
  const totalSteps = 11

  useEffect(() => {
    if (slug) {
      fetch(`/api/sales-reps?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.rep) {
            setSalesRep(data.rep)
          } else {
            setRepError("Sales representative not found")
          }
          setRepLoading(false)
        })
        .catch(() => {
          setRepError("Failed to load sales representative")
          setRepLoading(false)
        })
    }
  }, [slug])

  const handleNeedsChange = (key: string, checked: boolean) => {
    setNeedsAssessment(prev => ({ ...prev, [key]: checked }))
  }

  const handleResponseChange = (toolKey: string, questionId: string, value: boolean) => {
    setResponses(prev => ({
      ...prev,
      [toolKey]: { ...prev[toolKey], [questionId]: value }
    }))
  }

  const handleConfidenceChange = (toolKey: string, category: string, rating: number) => {
    setConfidenceRatings(prev => ({
      ...prev,
      [toolKey]: { ...prev[toolKey], [category]: rating }
    }))
  }

  const isStepComplete = () => {
    if (currentStep === 0) {
      return clientName.trim() !== "" && clientEmail.trim() !== "" && clientEmail.includes("@")
    }
    if (currentStep === 1) {
      return true // Needs assessment is optional
    }
    if (currentStep >= 2 && currentStep <= 8) {
      const toolStep = TOOL_STEPS[currentStep - 2]
      const toolResponses = responses[toolStep.toolKey]
      return toolStep.questions.every(q => toolResponses[q.id] !== undefined)
    }
    if (currentStep === 9) {
      return TOOL_STEPS.every(tool => {
        const ratings = confidenceRatings[tool.toolKey]
        return ratings && CONFIDENCE_CATEGORIES.every(cat => ratings[cat.key] > 0)
      })
    }
    return true
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/client-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesRepSlug: slug,
          clientName,
          clientEmail,
          clientPhone,
          clientCompany,
          needsAssessment: {
            ...needsAssessment,
            other: needsOther,
            timeline,
            additionalNotes
          },
          responses,
          confidenceRatings,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSuccess(true)
        setScores(data.scores)
        setCurrentStep(11)
      } else {
        setSubmitError(data.error || "Submission failed")
      }
    } catch {
      setSubmitError("Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculatePreviewScores = () => {
    let totalYes = 0
    let totalQuestions = 0
    TOOL_STEPS.forEach(tool => {
      tool.questions.forEach(q => {
        totalQuestions++
        if (responses[tool.toolKey][q.id] === true) totalYes++
      })
    })

    let totalConfidence = 0
    let ratingCount = 0
    Object.values(confidenceRatings).forEach(ratings => {
      Object.values(ratings).forEach(rating => {
        totalConfidence += rating
        ratingCount++
      })
    })

    return {
      capabilityScore: totalYes,
      capabilityPercent: totalQuestions > 0 ? Math.round((totalYes / totalQuestions) * 100) : 0,
      confidenceScore: ratingCount > 0 ? (totalConfidence / ratingCount).toFixed(1) : "0.0",
      totalQuestions
    }
  }

  // Loading state
  if (repLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (repError || !salesRep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Link Not Found</CardTitle>
            <CardDescription>
              This survey link is not valid. Please contact your Pacific Coast Title representative for a valid link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const renderStep = () => {
    // Step 0: Client Information
    if (currentStep === 0) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900">Welcome!</CardTitle>
                <CardDescription className="text-slate-600">
                  Survey shared by <span className="font-semibold text-blue-700">{salesRep.name}</span>
                </CardDescription>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mt-4">
              Thank you for taking the time to complete this assessment. Your responses will help us understand 
              your familiarity with our tools and identify how we can best support you.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Company / Brokerage
                </Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Step 1: Needs Assessment
    if (currentStep === 1) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-indigo-700" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900">What Are You Looking For?</CardTitle>
                <CardDescription className="text-slate-600">
                  Help us understand your needs so we can better serve you.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Select all services you're interested in:</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {NEEDS_OPTIONS.map(option => (
                  <div 
                    key={option.key} 
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                      needsAssessment[option.key] 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    onClick={() => handleNeedsChange(option.key, !needsAssessment[option.key])}
                  >
                    <Checkbox 
                      checked={needsAssessment[option.key] || false}
                      onCheckedChange={(checked) => handleNeedsChange(option.key, checked as boolean)}
                    />
                    <span className="text-slate-700">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other">Other needs or specific requests:</Label>
              <Textarea
                id="other"
                placeholder="Describe any other services or tools you're interested in..."
                value={needsOther}
                onChange={(e) => setNeedsOther(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">When do you need these services?</Label>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map(option => (
                  <Button
                    key={option}
                    type="button"
                    variant={timeline === option ? "default" : "outline"}
                    className={`${timeline === option ? 'bg-blue-600' : ''}`}
                    onClick={() => setTimeline(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional notes:</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information you'd like to share..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
      )
    }

    // Steps 2-8: Tool Questions
    if (currentStep >= 2 && currentStep <= 8) {
      const toolStep = TOOL_STEPS[currentStep - 2]
      const toolResponses = responses[toolStep.toolKey]

      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-blue-700" />
              </div>
              <CardTitle className="text-2xl text-blue-900">{toolStep.toolName}</CardTitle>
            </div>
            <CardDescription className="text-slate-600">
              Please answer the following questions about your experience with {toolStep.toolName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolStep.questions.map((question, index) => (
                <div key={question.id} className="space-y-3 pb-4 border-b last:border-b-0">
                  <Label className="text-base font-medium leading-relaxed text-slate-800">
                    {index + 1}. {question.text}
                  </Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={toolResponses[question.id] === true ? "default" : "outline"}
                      className={`flex-1 h-11 ${toolResponses[question.id] === true ? 'bg-blue-600' : ''}`}
                      onClick={() => handleResponseChange(toolStep.toolKey, question.id, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={toolResponses[question.id] === false ? "default" : "outline"}
                      className={`flex-1 h-11 ${toolResponses[question.id] === false ? 'bg-slate-700' : ''}`}
                      onClick={() => handleResponseChange(toolStep.toolKey, question.id, false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Step 9: Confidence Ratings
    if (currentStep === 9) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Confidence Level Assessment</CardTitle>
            <CardDescription className="text-slate-600">
              Rate your confidence level for each tool. Use a scale of 1 (No Knowledge) to 5 (Expert Level).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {TOOL_STEPS.map(tool => (
                <div key={tool.toolKey} className="space-y-4 p-4 bg-white rounded-xl border">
                  <h3 className="font-semibold text-lg text-blue-900">{tool.toolName}</h3>
                  <div className="space-y-4">
                    {CONFIDENCE_CATEGORIES.map(category => (
                      <div key={category.key} className="space-y-2">
                        <Label className="text-sm text-slate-700">{category.label}</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              type="button"
                              variant={confidenceRatings[tool.toolKey]?.[category.key] === rating ? "default" : "outline"}
                              className={`flex-1 h-11 font-semibold ${
                                confidenceRatings[tool.toolKey]?.[category.key] === rating ? 'bg-blue-600' : ''
                              }`}
                              onClick={() => handleConfidenceChange(tool.toolKey, category.key, rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Step 10: Review & Submit
    if (currentStep === 10) {
      const previewScores = calculatePreviewScores()
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Review Your Assessment</CardTitle>
            <CardDescription className="text-slate-600">
              Review your scores below, then submit your assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardDescription>Capability Score</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">
                    {previewScores.capabilityScore}/{previewScores.totalQuestions} ({previewScores.capabilityPercent}%)
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-white">
                <CardHeader>
                  <CardDescription>Average Confidence</CardDescription>
                  <CardTitle className="text-3xl text-indigo-600">{previewScores.confidenceScore}/5</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <h4 className="font-medium text-slate-700 mb-2">Your Information</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">Name:</span> {clientName}</div>
                <div><span className="text-slate-500">Email:</span> {clientEmail}</div>
                {clientPhone && <div><span className="text-slate-500">Phone:</span> {clientPhone}</div>}
                {clientCompany && <div><span className="text-slate-500">Company:</span> {clientCompany}</div>}
              </div>
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              size="lg" 
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Assessment"
              )}
            </Button>
          </CardContent>
        </Card>
      )
    }

    // Step 11: Success
    if (currentStep === 11 && isSuccess) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-700">Thank You, {clientName}!</CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Your assessment has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {scores && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white">
                  <CardHeader>
                    <CardDescription>Your Capability Score</CardDescription>
                    <CardTitle className="text-3xl text-blue-600">{scores.capability}%</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-white">
                  <CardHeader>
                    <CardDescription>Your Confidence Score</CardDescription>
                    <CardTitle className="text-3xl text-indigo-600">{scores.confidence}/5</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>{salesRep.name}</strong> will review your responses and reach out to discuss 
                how Pacific Coast Title can best support your needs.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  const progress = currentStep === 11 ? 100 : (currentStep / (totalSteps - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 tracking-tight">
            Pacific Coast Title
          </h1>
          <p className="text-slate-600 text-lg">Tool Competency Assessment</p>
        </div>

        {/* Progress Bar */}
        {currentStep < 11 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-slate-700">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">{renderStep()}</div>

        {/* Navigation */}
        {!isSuccess && currentStep < 11 && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardFooter className="flex justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isSubmitting}
                size="lg"
                className="flex-1 h-12 bg-transparent"
              >
                Previous
              </Button>
              {currentStep < 10 && (
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete() || isSubmitting}
                  size="lg"
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === 9 ? "Review & Submit" : "Continue"}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
