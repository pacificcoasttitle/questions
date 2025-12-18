"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"

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
      {
        id: "q3",
        text: "Are you checking weekly? (Sales Units, Refi Units, Revenue, Pipeline, Assigned Accounts, Activity Metrics)",
      },
      {
        id: "q4",
        text: "Do you know how to track: Personal goals, Monthly targets, Year-over-year comparison, Daily activity requirements",
      },
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

export default function AssessmentWizard() {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [responses, setResponses] = useState<Record<string, Record<string, boolean>>>({
    "title-profile": {},
    "title-toolbox": {},
    "pacific-agent-one": {},
    "pct-smart-direct": {},
    "pct-website": {},
    trainings: {},
    "sales-dashboard": {},
  })
  const [confidenceRatings, setConfidenceRatings] = useState<
    Record<
      string,
      {
        awareness: number
        access: number
        setup: number
        usage: number
        needTraining: number
      }
    >
  >({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [scores, setScores] = useState<{ capability: number; confidence: number } | null>(null)

  const totalSteps = 9 // 0=intro, 1-7=tools, 8=confidence, 9=results

  const handleResponseChange = (toolKey: string, questionId: string, value: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [toolKey]: {
        ...prev[toolKey],
        [questionId]: value,
      },
    }))
  }

  const handleConfidenceChange = (toolKey: string, category: string, rating: number) => {
    setConfidenceRatings((prev) => ({
      ...prev,
      [toolKey]: {
        ...prev[toolKey],
        [category]: rating,
      },
    }))
  }

  const isStepComplete = () => {
    if (currentStep === 0) {
      return userName.trim() !== "" && userEmail.trim() !== "" && userEmail.includes("@")
    }
    if (currentStep >= 1 && currentStep <= 7) {
      const toolStep = TOOL_STEPS[currentStep - 1]
      const toolResponses = responses[toolStep.toolKey]
      return toolStep.questions.every((q) => toolResponses[q.id] !== undefined)
    }
    if (currentStep === 8) {
      return TOOL_STEPS.every((tool) => {
        const ratings = confidenceRatings[tool.toolKey]
        return ratings && CONFIDENCE_CATEGORIES.every((cat) => ratings[cat.key as keyof typeof ratings] > 0)
      })
    }
    return true
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondentName: userName,
          respondentEmail: userEmail,
          responses,
          confidenceRatings,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSuccess(true)
        setScores(data.scores)
        setCurrentStep(9)
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
    TOOL_STEPS.forEach((tool) => {
      tool.questions.forEach((q) => {
        totalQuestions++
        if (responses[tool.toolKey][q.id] === true) {
          totalYes++
        }
      })
    })

    let totalConfidence = 0
    let ratingCount = 0
    Object.values(confidenceRatings).forEach((ratings) => {
      Object.values(ratings).forEach((rating) => {
        totalConfidence += rating
        ratingCount++
      })
    })

    const capabilityScore = totalYes
    const capabilityPercent = totalQuestions > 0 ? Math.round((totalYes / totalQuestions) * 100) : 0
    const confidenceScore = ratingCount > 0 ? (totalConfidence / ratingCount).toFixed(1) : "0.0"

    return { capabilityScore, capabilityPercent, confidenceScore, totalQuestions }
  }

  const renderStep = () => {
    // Step 0: User Information
    if (currentStep === 0) {
      return (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl text-balance">Welcome to the Sales Tool Competency Assessment</CardTitle>
            <CardDescription className="text-base">
              This assessment will help us understand your familiarity with Pacific Coast Title's sales tools and
              identify areas where additional training may be beneficial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>
      )
    }

    // Steps 1-7: Tool Questions
    if (currentStep >= 1 && currentStep <= 7) {
      const toolStep = TOOL_STEPS[currentStep - 1]
      const toolResponses = responses[toolStep.toolKey]

      return (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">{toolStep.toolName}</CardTitle>
            <CardDescription>
              Please answer the following questions about your experience with {toolStep.toolName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolStep.questions.map((question, index) => (
                <div key={question.id} className="space-y-3 pb-4 border-b last:border-b-0">
                  <Label className="text-base font-medium leading-relaxed">
                    {index + 1}. {question.text}
                  </Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={toolResponses[question.id] === true ? "default" : "outline"}
                      className="flex-1 h-11"
                      onClick={() => handleResponseChange(toolStep.toolKey, question.id, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={toolResponses[question.id] === false ? "default" : "outline"}
                      className="flex-1 h-11"
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

    // Step 8: Confidence Ratings
    if (currentStep === 8) {
      return (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Confidence Level Assessment</CardTitle>
            <CardDescription>
              Rate your confidence level for each tool across the following areas. Use a scale of 1 (No Knowledge) to 5
              (Expert Level).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {TOOL_STEPS.map((tool) => (
                <div key={tool.toolKey} className="space-y-4">
                  <h3 className="font-semibold text-lg">{tool.toolName}</h3>
                  <div className="space-y-4">
                    {CONFIDENCE_CATEGORIES.map((category) => (
                      <div key={category.key} className="space-y-2">
                        <Label className="text-sm">{category.label}</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant={
                                confidenceRatings[tool.toolKey]?.[
                                  category.key as keyof (typeof confidenceRatings)[string]
                                ] === rating
                                  ? "default"
                                  : "outline"
                              }
                              className="flex-1 h-11 font-semibold"
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

    // Step 9: Review & Submit
    if (currentStep === 9) {
      if (isSuccess && scores) {
        return (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Thank you, {userName}!</CardTitle>
              </div>
              <CardDescription className="text-base">Your responses have been successfully saved.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription>Capability Score</CardDescription>
                    <CardTitle className="text-3xl">{scores.capability}%</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Average Confidence</CardDescription>
                    <CardTitle className="text-3xl">{scores.confidence}/5</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <Alert>
                <AlertDescription className="text-base">
                  A member of our training team will review your responses and reach out with personalized
                  recommendations for improving your tool proficiency.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )
      }

      const previewScores = calculatePreviewScores()
      return (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Review Your Assessment</CardTitle>
            <CardDescription>Review your scores below, then submit your assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardDescription>Capability Score</CardDescription>
                  <CardTitle className="text-3xl">
                    {previewScores.capabilityScore}/{previewScores.totalQuestions} ({previewScores.capabilityPercent}%)
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Average Confidence</CardDescription>
                  <CardTitle className="text-3xl">{previewScores.confidenceScore}/5</CardTitle>
                </CardHeader>
              </Card>
            </div>
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full h-12 text-base">
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

    return null
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50/50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-balance">
            Pacific Coast Title
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Sales Tool Competency Assessment</p>
        </div>

        {/* Progress Bar */}
        {currentStep < 9 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-500 via-slate-400 to-stone-400 dark:from-slate-500 dark:via-slate-400 dark:to-stone-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">{renderStep()}</div>

        {/* Navigation */}
        {!isSuccess && (
          <Card className="border-0 shadow-sm">
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
              {currentStep < 9 && (
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete() || isSubmitting}
                  size="lg"
                  className="flex-1 h-12"
                >
                  {currentStep === 8 ? "Review & Submit" : "Next"}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
