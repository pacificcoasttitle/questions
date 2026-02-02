"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, FileText, Building2, User, Calendar, ClipboardCheck } from "lucide-react"

type Section = {
  id: string
  title: string
  description: string
  questions: {
    id: string
    label: string
    instructions: string
    placeholder: string
  }[]
}

const SECTIONS: Section[] = [
  {
    id: "technical",
    title: "Section I – Technical Title Competency",
    description: "Assess your technical knowledge and expertise in title operations.",
    questions: [
      {
        id: "q1_title_knowledge",
        label: "1. Title Knowledge & Expertise",
        instructions: "Describe your current level of proficiency in title examination, underwriting guidelines, curative practices, and jurisdiction-specific issues. Identify areas of strength and areas requiring improvement. Include steps taken within the last year to enhance your technical knowledge.",
        placeholder: "Describe your proficiency, strengths, areas for improvement, and recent professional development..."
      },
      {
        id: "q2_risk_identification",
        label: "2. Risk Identification & Problem Resolution",
        instructions: "Evaluate your effectiveness in identifying title defects, managing complex title issues, and resolving problems prior to closing. Cite examples of challenges, errors, or near-misses and what was learned from them.",
        placeholder: "Describe your approach to risk identification, specific examples, and lessons learned..."
      }
    ]
  },
  {
    id: "operational",
    title: "Section II – Operational Performance",
    description: "Evaluate your unit's operational efficiency and quality standards.",
    questions: [
      {
        id: "q3_workload_management",
        label: "3. Workload Management & Turnaround Times",
        instructions: "Assess how effectively your unit manages file volume, turnaround expectations, and priority transactions while maintaining accuracy. Identify recurring bottlenecks or inefficiencies.",
        placeholder: "Describe workload management practices, efficiency metrics, and identified bottlenecks..."
      },
      {
        id: "q4_process_consistency",
        label: "4. Process Consistency & Quality Control",
        instructions: "Describe the systems, checks, or workflows in place to ensure consistent quality and minimize errors. Identify gaps or areas where controls could be strengthened.",
        placeholder: "Describe quality control systems, workflows, and areas for improvement..."
      }
    ]
  },
  {
    id: "customer",
    title: "Section III – Customer Interaction & Communication",
    description: "Evaluate customer service and communication effectiveness.",
    questions: [
      {
        id: "q5_customer_service",
        label: "5. Customer Service & Client Experience",
        instructions: "Objectively evaluate your unit's responsiveness, professionalism, and clarity when interacting with customers, lenders, attorneys, and agents. Reference client feedback, trends, or service metrics where available.",
        placeholder: "Describe customer service standards, feedback received, and service metrics..."
      },
      {
        id: "q6_internal_external_communication",
        label: "6. Internal & External Communication",
        instructions: "Assess the effectiveness of communication within your unit and with other departments (escrow/closing, sales, underwriting). Identify instances where communication breakdowns affected outcomes.",
        placeholder: "Describe communication practices, coordination with other departments, and improvement areas..."
      }
    ]
  },
  {
    id: "leadership",
    title: "Section IV – Leadership & Management",
    description: "Evaluate leadership effectiveness and team development (if applicable).",
    questions: [
      {
        id: "q7_team_leadership",
        label: "7. Team Leadership & Accountability",
        instructions: "Evaluate your leadership approach, including delegation, accountability, and performance management. How do you address underperformance or behavioral issues?",
        placeholder: "Describe your leadership style, accountability measures, and approach to performance management..."
      },
      {
        id: "q8_training_succession",
        label: "8. Training, Cross-Training & Succession Risk",
        instructions: "Describe how your unit trains new staff, develops existing team members, and mitigates key-person dependency risk.",
        placeholder: "Describe training programs, cross-training initiatives, and succession planning..."
      }
    ]
  },
  {
    id: "compliance",
    title: "Section V – Compliance & Judgment",
    description: "Assess compliance practices and decision-making quality.",
    questions: [
      {
        id: "q9_underwriting_compliance",
        label: "9. Underwriting, Compliance & Decision-Making",
        instructions: "Assess your adherence to underwriting requirements, regulatory obligations, and company policies. Provide examples of high-risk or time-sensitive decisions and their outcomes.",
        placeholder: "Describe compliance practices, policy adherence, and examples of critical decisions..."
      }
    ]
  },
  {
    id: "overall",
    title: "Section VI – Overall Assessment",
    description: "Provide a comprehensive evaluation and improvement plan.",
    questions: [
      {
        id: "q10_overall_evaluation",
        label: "10. Overall Unit Evaluation & Improvement Plan",
        instructions: "If evaluating your title unit as an underwriter or external auditor, identify:\n• Core strengths\n• Primary risks or vulnerabilities\n• Top three operational or strategic improvements you would implement immediately",
        placeholder: "Provide an objective assessment including core strengths, risks/vulnerabilities, and your top 3 improvement priorities..."
      }
    ]
  }
]

export default function TitleOfficerWizard() {
  // Header fields
  const [company, setCompany] = useState("")
  const [titleOfficerName, setTitleOfficerName] = useState("")
  const [titleUnitLocation, setTitleUnitLocation] = useState("")
  const [evaluationPeriod, setEvaluationPeriod] = useState("")
  const [dateCompleted, setDateCompleted] = useState("")
  
  // Responses
  const [responses, setResponses] = useState<Record<string, string>>({})
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState<number | null>(null)

  // Total steps: 0=intro, 1-6=sections, 7=review/certification
  const totalSteps = 8

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const isStepComplete = () => {
    if (currentStep === 0) {
      return (
        company.trim() !== "" &&
        titleOfficerName.trim() !== "" &&
        titleUnitLocation.trim() !== "" &&
        evaluationPeriod.trim() !== "" &&
        dateCompleted.trim() !== ""
      )
    }
    if (currentStep >= 1 && currentStep <= 6) {
      const section = SECTIONS[currentStep - 1]
      return section.questions.every(q => 
        responses[q.id] && responses[q.id].trim().length >= 50
      )
    }
    return true
  }

  const getStepValidationMessage = () => {
    if (currentStep >= 1 && currentStep <= 6) {
      const section = SECTIONS[currentStep - 1]
      const incomplete = section.questions.find(q => 
        !responses[q.id] || responses[q.id].trim().length < 50
      )
      if (incomplete) {
        const currentLength = responses[incomplete.id]?.trim().length || 0
        return `Please provide a detailed response (at least 50 characters) for each question. Current: ${currentLength}/50`
      }
    }
    return null
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
      const res = await fetch("/api/title-officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          titleOfficerName,
          titleUnitLocation,
          evaluationPeriod,
          dateCompleted,
          responses
        })
      })
      const data = await res.json()
      if (data.success) {
        setIsSuccess(true)
        setSubmissionId(data.id)
        setCurrentStep(8) // Success screen
      } else {
        setSubmitError(data.error || "Submission failed")
      }
    } catch {
      setSubmitError("Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    // Step 0: Header Information
    if (currentStep === 0) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">Title Officer Self-Evaluation</CardTitle>
                <CardDescription className="text-amber-700/80 dark:text-amber-300/70">
                  Pacific Coast Title Company
                </CardDescription>
              </div>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-4">
              This self-evaluation is intended to provide a comprehensive and candid assessment of individual performance, 
              leadership effectiveness, technical competency, and overall title unit operations. 
              <strong className="text-stone-800 dark:text-stone-200"> Narrative responses are required.</strong> Be specific, objective, 
              and supported by examples where possible.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                  <Building2 className="h-4 w-4" />
                  Company *
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-12 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officer" className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                  <User className="h-4 w-4" />
                  Title Officer / Unit Leader *
                </Label>
                <Input
                  id="officer"
                  type="text"
                  placeholder="Enter your name"
                  value={titleOfficerName}
                  onChange={(e) => setTitleOfficerName(e.target.value)}
                  className="h-12 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-stone-700 dark:text-stone-200">Title Unit / Location *</Label>
              <Input
                id="unit"
                type="text"
                placeholder="Enter title unit or location"
                value={titleUnitLocation}
                onChange={(e) => setTitleUnitLocation(e.target.value)}
                className="h-12 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="period" className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                  <Calendar className="h-4 w-4" />
                  Evaluation Period *
                </Label>
                <Input
                  id="period"
                  type="text"
                  placeholder="e.g., Q4 2025 or Jan-Dec 2025"
                  value={evaluationPeriod}
                  onChange={(e) => setEvaluationPeriod(e.target.value)}
                  className="h-12 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-stone-700 dark:text-stone-200">Date Completed *</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateCompleted}
                  onChange={(e) => setDateCompleted(e.target.value)}
                  className="h-12 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Steps 1-6: Section Questions
    if (currentStep >= 1 && currentStep <= 6) {
      const section = SECTIONS[currentStep - 1]
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">{section.title}</CardTitle>
            <CardDescription className="text-stone-600 dark:text-stone-300 text-base">
              {section.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {section.questions.map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-lg font-semibold text-stone-800 dark:text-stone-100 block">
                  {question.label}
                </Label>
                <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                  {question.instructions}
                </p>
                <Textarea
                  value={responses[question.id] || ""}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="min-h-[180px] bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-base leading-relaxed resize-y"
                />
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {responses[question.id]?.length || 0} characters (minimum 50 required)
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )
    }

    // Step 7: Review & Certification
    if (currentStep === 7) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-amber-700 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">Review & Certification</CardTitle>
            </div>
            <CardDescription className="text-stone-600 dark:text-stone-300 text-base">
              Please review your responses before submitting. By submitting, you certify that this self-evaluation 
              is accurate and completed to the best of your knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Info */}
            <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-3">Evaluation Information</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-stone-500 dark:text-stone-400">Company:</span> <span className="text-stone-800 dark:text-stone-100 font-medium">{company}</span></div>
                <div><span className="text-stone-500 dark:text-stone-400">Title Officer:</span> <span className="text-stone-800 dark:text-stone-100 font-medium">{titleOfficerName}</span></div>
                <div><span className="text-stone-500 dark:text-stone-400">Unit/Location:</span> <span className="text-stone-800 dark:text-stone-100 font-medium">{titleUnitLocation}</span></div>
                <div><span className="text-stone-500 dark:text-stone-400">Period:</span> <span className="text-stone-800 dark:text-stone-100 font-medium">{evaluationPeriod}</span></div>
              </div>
            </div>

            {/* Response Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100">Response Summary</h3>
              {SECTIONS.map((section) => (
                <div key={section.id} className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                  <h4 className="font-medium text-stone-700 dark:text-stone-200 mb-2">{section.title}</h4>
                  <div className="space-y-2">
                    {section.questions.map((q) => (
                      <div key={q.id} className="flex items-center justify-between text-sm">
                        <span className="text-stone-600 dark:text-stone-300">{q.label}</span>
                        <span className={`font-medium ${responses[q.id]?.length >= 50 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {responses[q.id]?.length || 0} chars
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Certification */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
              <p className="text-amber-900 dark:text-amber-100 font-medium">
                Title Officer Certification
              </p>
              <p className="text-amber-800 dark:text-amber-200 text-sm mt-2">
                By clicking "Submit Evaluation" below, I certify that this self-evaluation is accurate 
                and completed to the best of my knowledge.
              </p>
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
              className="w-full h-14 text-base bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Evaluation...
                </>
              ) : (
                "Submit Evaluation"
              )}
            </Button>
          </CardContent>
        </Card>
      )
    }

    // Step 8: Success
    if (currentStep === 8 && isSuccess) {
      return (
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-800 dark:text-green-200">Thank You, {titleOfficerName}!</CardTitle>
            <CardDescription className="text-stone-600 dark:text-stone-300 text-lg">
              Your self-evaluation has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-stone-600 dark:text-stone-300 mb-2">Submission Reference</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">#{submissionId}</p>
            </div>
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertDescription className="text-amber-900 dark:text-amber-100">
                Your evaluation will be reviewed by management. You may be contacted for follow-up 
                discussions regarding your responses and development opportunities.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  const progress = currentStep === 8 ? 100 : (currentStep / (totalSteps - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 dark:from-stone-950 dark:via-stone-900 dark:to-amber-950">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/30 dark:bg-amber-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-300/30 dark:bg-stone-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2 tracking-tight">
            Pacific Coast Title
          </h1>
          <p className="text-stone-600 dark:text-stone-300 text-lg">Title Officer Self-Evaluation Form</p>
        </div>

        {/* Progress Bar */}
        {currentStep < 8 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                {currentStep === 0 ? "Getting Started" : currentStep <= 6 ? `Section ${currentStep} of 6` : "Review & Submit"}
              </span>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 dark:from-amber-700 dark:via-amber-600 dark:to-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex justify-between mt-3">
              {["Info", "I", "II", "III", "IV", "V", "VI", "Submit"].map((label, idx) => (
                <div 
                  key={idx} 
                  className={`text-xs font-medium ${
                    idx <= currentStep 
                      ? 'text-amber-700 dark:text-amber-400' 
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">{renderStep()}</div>

        {/* Navigation */}
        {!isSuccess && currentStep < 8 && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm">
            <CardFooter className="flex flex-col gap-4 pt-6">
              {getStepValidationMessage() && (
                <p className="text-sm text-amber-700 dark:text-amber-400 text-center">
                  {getStepValidationMessage()}
                </p>
              )}
              <div className="flex justify-between gap-4 w-full">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || isSubmitting}
                  size="lg"
                  className="flex-1 h-12 bg-transparent border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700"
                >
                  Previous
                </Button>
                {currentStep < 7 && (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepComplete() || isSubmitting}
                    size="lg"
                    className="flex-1 h-12 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
                  >
                    {currentStep === 6 ? "Review & Certify" : "Continue"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
