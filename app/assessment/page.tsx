'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Loader2 } from 'lucide-react';
import { ASSESSMENT_QUESTIONS } from '@/lib/constants';
import { toast } from 'sonner';

export default function AssessmentPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const question = ASSESSMENT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleSingleSelect = (questionId: string, value: string) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleMultiSelect = (questionId: string, value: string) => {
    const current = (responses[questionId] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setResponses({ ...responses, [questionId]: updated });
  };

  const handleScale = (questionId: string, value: number[]) => {
    setResponses({ ...responses, [questionId]: value[0].toString() });
  };

  const canProceed = () => {
    const response = responses[question.id];
    if (!response) return false;
    if (Array.isArray(response)) return response.length > 0;
    return response !== '';
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('assessments').insert({
        user_id: user.id,
        responses,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setCompleted(true);
      toast.success('Assessment completed!');
    } catch {
      toast.error('Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nuru-green-50 via-white to-nuru-gold-50 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-nuru-green-100">
              <CheckCircle2 className="h-8 w-8 text-nuru-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-nuru-green-800 mb-2">Assessment Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your responses have been recorded. Now let&apos;s generate your personalized career pathways.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="bg-nuru-green-600 hover:bg-nuru-green-700">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuru-green-50 via-white to-nuru-gold-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Compass className="h-5 w-5 text-nuru-green-600" />
            <span className="text-sm font-medium text-nuru-green-600">Career Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-nuru-green-800">Discover Your Path</h1>
          <p className="text-muted-foreground mt-1">Answer these questions to help our AI find your best career matches</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}</span>
            <span className="text-sm font-medium text-nuru-green-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{question.question}</CardTitle>
            <CardDescription>
              {question.type === 'multi_select' ? 'Select all that apply' : question.type === 'scale' ? 'Drag the slider' : 'Choose one option'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {question.type === 'single_select' && (
              <RadioGroup
                value={(responses[question.id] as string) || ''}
                onValueChange={(v) => handleSingleSelect(question.id, v)}
                className="space-y-3"
              >
                {question.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-nuru-green-50 transition-colors cursor-pointer">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                    <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'multi_select' && (
              <div className="flex flex-wrap gap-2">
                {question.options?.map((option) => {
                  const selected = ((responses[question.id] as string[]) || []).includes(option);
                  return (
                    <Badge
                      key={option}
                      variant={selected ? 'default' : 'outline'}
                      className={`cursor-pointer py-2 px-4 transition-colors ${selected ? 'bg-nuru-green-600 hover:bg-nuru-green-700' : 'hover:bg-nuru-green-50'}`}
                      onClick={() => handleMultiSelect(question.id, option)}
                    >
                      {option}
                    </Badge>
                  );
                })}
              </div>
            )}

            {question.type === 'scale' && (
              <div className="pt-4 px-2">
                <Slider
                  min={question.min}
                  max={question.max}
                  step={1}
                  value={[parseInt((responses[question.id] as string) || question.min.toString())]}
                  onValueChange={(v) => handleScale(question.id, v)}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{question.labels?.[0]}</span>
                  <span className="font-medium text-nuru-green-700 text-lg">
                    {responses[question.id] || question.min}
                  </span>
                  <span>{question.labels?.[1]}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {currentQuestion < ASSESSMENT_QUESTIONS.length - 1 ? (
                <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={!canProceed()} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || loading} className="bg-nuru-green-600 hover:bg-nuru-green-700">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <>Submit Assessment <CheckCircle2 className="ml-2 h-4 w-4" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
