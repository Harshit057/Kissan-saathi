'use client';

import { BookOpen, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  lessons: string[];
  completed: boolean;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'जैविक खेती की मूल बातें',
    description: 'जैविक खेती शुरू करने के लिए एक व्यापक गाइड।',
    duration: '45 मिनट',
    difficulty: 'beginner',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    lessons: [
      'मिट्टी की तैयारी',
      'खाद बनाना',
      'कीट नियंत्रण',
      'पानी का प्रबंधन',
      'फसल का चयन',
    ],
    completed: false,
  },
  {
    id: '2',
    title: 'सिंचाई तकनीकें',
    description: 'पानी बचाने के लिए आधुनिक सिंचाई विधियाँ।',
    duration: '30 मिनट',
    difficulty: 'intermediate',
    lessons: [
      'ड्रिप सिंचाई',
      'स्प्रिंकलर विधि',
      'बोरवेल प्रबंधन',
      'पानी की बचत की तकनीकें',
    ],
    completed: false,
  },
  {
    id: '3',
    title: 'कीट और रोग प्रबंधन',
    description: 'फसल के रोगों से बचाव के उपाय।',
    duration: '50 मिनट',
    difficulty: 'intermediate',
    lessons: [
      'सामान्य कीट पहचान',
      'प्राकृतिक कीटनाशक',
      'रोग का निदान',
      'जैविक नियंत्रण',
    ],
    completed: false,
  },
  {
    id: '4',
    title: 'फसल विविधीकरण',
    description: 'अधिक आय के लिए विभिन्न फसलें उगाएँ।',
    duration: '35 मिनट',
    difficulty: 'intermediate',
    lessons: [
      'फसल चक्र',
      'अंतरफसल',
      'नकद फसलें',
      'बागवानी फसलें',
    ],
    completed: false,
  },
  {
    id: '5',
    title: 'मिट्टी परीक्षण और स्वास्थ्य',
    description: 'स्वस्थ मिट्टी के लिए परीक्षण और सुधार।',
    duration: '40 मिनट',
    difficulty: 'intermediate',
    lessons: [
      'मिट्टी परीक्षण विधि',
      'पोषक तत्व विश्लेषण',
      'पीएच समायोजन',
      'जैव विविधता',
    ],
    completed: false,
  },
  {
    id: '6',
    title: 'आधुनिक खेती उपकरण',
    description: 'नए उपकरणों का सही उपयोग और रखरखाव।',
    duration: '45 मिनट',
    difficulty: 'advanced',
    lessons: [
      'ड्रोन का उपयोग',
      'मिट्टी की नमी सेंसर',
      'मशीनीकरण',
      'संरक्षण कृषि',
    ],
    completed: false,
  },
];

export default function LearningPage() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());

  const toggleCourseCompletion = (courseId: string) => {
    const newCompleted = new Set(completedCourses);
    if (newCompleted.has(courseId)) {
      newCompleted.delete(courseId);
    } else {
      newCompleted.add(courseId);
    }
    setCompletedCourses(newCompleted);
  };

  const difficultyConfig = {
    beginner: { label: 'शुरुआती', color: 'bg-green-100 text-green-800' },
    intermediate: { label: 'माध्यमिक', color: 'bg-blue-100 text-blue-800' },
    advanced: { label: 'उन्नत', color: 'bg-purple-100 text-purple-800' },
  };

  const completionPercentage = Math.round((completedCourses.size / courses.length) * 100);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen size={32} className="text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">सीखने का केंद्र</h1>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">आपकी प्रगति</h2>
          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-base text-muted-foreground mt-3">
          {completedCourses.size} / {courses.length} पाठ्यक्रम पूर्ण
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const difficulty = difficultyConfig[course.difficulty];
          const isCompleted = completedCourses.has(course.id);
          const isExpanded = expandedCourse === course.id;

          return (
            <div
              key={course.id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 transition ${
                isCompleted ? 'border-green-300' : 'border-border'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                      {isCompleted && <CheckCircle2 size={24} className="text-green-600" />}
                      {course.title}
                    </h3>
                    <p className="text-base text-muted-foreground">{course.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                    {course.duration}
                  </span>
                </div>

                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="flex items-center gap-2 text-primary font-bold text-base hover:underline mb-4"
                >
                  <PlayCircle size={20} />
                  पाठ्यक्रम देखें
                </button>

                {isExpanded && (
                  <div className="border-t-2 border-border pt-4">
                    {course.videoUrl && (
                      <div className="mb-4">
                        <iframe
                          className="w-full h-48 rounded-lg"
                          src={course.videoUrl}
                          title={course.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    <h4 className="font-bold text-foreground mb-3 text-lg">पाठों में:</h4>
                    <ul className="space-y-2 mb-4">
                      {course.lessons.map((lesson, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-base text-foreground"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                          {lesson}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => toggleCourseCompletion(course.id)}
                      className={`w-full h-12 font-bold text-lg rounded-lg transition ${
                        isCompleted
                          ? 'bg-green-100 hover:bg-green-200 text-green-800'
                          : 'bg-primary hover:bg-secondary text-white'
                      }`}
                    >
                      {isCompleted ? '✓ पूर्ण किया गया' : 'पूर्ण के रूप में चिह्नित करें'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
