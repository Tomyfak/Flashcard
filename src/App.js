import React, { useState, useEffect, useRef } from 'react';
import { Brain, Plus, RotateCcw, CheckCircle, Trophy, Zap, Target, Gamepad2, Edit, Sparkles, BookOpen, Trash2, Download, Upload } from 'lucide-react';

export default function FlashcardApp() {
  const defaultCards = [
    { id: 1, front: 'Quelle est la capitale de la France ?', back: 'Paris', nextReview: Date.now(), interval: 1, easeFactor: 2.5 },
    { id: 2, front: 'Combien font 15 × 12 ?', back: '180', nextReview: Date.now(), interval: 1, easeFactor: 2.5 },
    { id: 3, front: 'Qui a écrit "Roméo et Juliette" ?', back: 'William Shakespeare', nextReview: Date.now(), interval: 1, easeFactor: 2.5 },
    { id: 4, front: 'Quel est le symbole chimique de l\'or ?', back: 'Au', nextReview: Date.now(), interval: 1, easeFactor: 2.5 },
    { id: 5, front: 'Combien y a-t-il de continents ?', back: '7', nextReview: Date.now(), interval: 1, easeFactor: 2.5 },
    { id: 6, front: 'Quelle est la plus grande planète du système solaire ?', back: 'Jupiter', nextReview: Date.now(), interval: 1, easeFactor: 2.5 }
  ];

  const loadInitialData = () => {
    const savedData = window.studyQuestData;
    if (savedData) {
      return savedData;
    }
    return {
      lessons: {
        'default': {
          name: 'Leçon Exemple',
          cards: defaultCards,
          stats: { studied: 0, correct: 0, incorrect: 0 }
        }
      },
      currentLessonId: 'default'
    };
  };

  const initialData = loadInitialData();

  const [lessons, setLessons] = useState(initialData.lessons);
  const [currentLessonId, setCurrentLessonId] = useState(initialData.currentLessonId);
  const [cards, setCards] = useState(initialData.lessons[initialData.currentLessonId].cards);
  const [stats, setStats] = useState(initialData.lessons[initialData.currentLessonId].stats);
  
  const [mode, setMode] = useState('menu');
  const [prevMode, setPrevMode] = useState('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  
  const [newLessonName, setNewLessonName] = useState('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonName, setEditingLessonName] = useState('');
  
  const [matchCards, setMatchCards] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  
  const [mcqQuestion, setMcqQuestion] = useState(null);
  const [mcqOptions, setMcqOptions] = useState([]);
  const [mcqAnswer, setMcqAnswer] = useState(null);
  const [mcqScore, setMcqScore] = useState(0);
  const [mcqTotal, setMcqTotal] = useState(0);
  
  const [typeQuestion, setTypeQuestion] = useState(null);
  const [typeInput, setTypeInput] = useState('');
  const [typeResult, setTypeResult] = useState(null);
  const [typeScore, setTypeScore] = useState(0);
  const [typeTotal, setTypeTotal] = useState(0);
  
  const fileInputRef = useRef(null);

  const dueCards = cards.filter(card => card.nextReview <= Date.now());
  const currentCard = dueCards[currentIndex] || dueCards[0];

  useEffect(() => {
    window.studyQuestData = {
      lessons: lessons,
      currentLessonId: currentLessonId
    };
  }, [lessons, currentLessonId]);

  useEffect(() => {
    if (lessons[currentLessonId]) {
      setLessons(prev => ({
        ...prev,
        [currentLessonId]: {
          ...prev[currentLessonId],
          cards: [...cards],
          stats: {...stats}
        }
      }));
    }
  }, [cards, stats, currentLessonId]);

  useEffect(() => {
    if (mode !== prevMode) {
      setAnimationKey(prev => prev + 1);
      setPrevMode(mode);
      window.scrollTo(0, 0);
    }
  }, [mode, prevMode]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const exportData = () => {
    const data = {
      lessons: lessons,
      currentLessonId: currentLessonId,
      exportDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-quest-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.lessons && data.currentLessonId) {
          setLessons(data.lessons);
          setCurrentLessonId(data.currentLessonId);
          setCards(data.lessons[data.currentLessonId].cards);
          setStats(data.lessons[data.currentLessonId].stats);
          setMode('menu');
        }
      } catch (error) {
        alert('Erreur de chargement du fichier. Veuillez vous assurer qu\'il s\'agit d\'un fichier de sauvegarde Study Quest valide.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const switchLesson = (lessonId) => {
    const lesson = lessons[lessonId];
    setCurrentLessonId(lessonId);
    setCards([...lesson.cards]);
    setStats({...lesson.stats});
    setCurrentIndex(0);
    setIsFlipped(false);
    setMode('menu');
  };

  const createNewLesson = () => {
    if (!newLessonName.trim()) return;
    
    const newId = Date.now().toString();
    const newLesson = {
      name: newLessonName,
      cards: [],
      stats: { studied: 0, correct: 0, incorrect: 0 }
    };
    
    setLessons(prev => ({
      ...prev,
      [newId]: newLesson
    }));
    
    setNewLessonName('');
    setShowLessonModal(false);
    
    setCurrentLessonId(newId);
    setCards([]);
    setStats({ studied: 0, correct: 0, incorrect: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
    setMode('menu');
  };

  const deleteLesson = (lessonId) => {
    if (Object.keys(lessons).length <= 1) return;
    
    const newLessons = { ...lessons };
    delete newLessons[lessonId];
    setLessons(newLessons);
    
    if (currentLessonId === lessonId) {
      const firstLessonId = Object.keys(newLessons)[0];
      switchLesson(firstLessonId);
    }
  };

  const startEditingLesson = (lessonId, lessonName) => {
    setEditingLessonId(lessonId);
    setEditingLessonName(lessonName);
  };

  const saveEditingLesson = () => {
    if (!editingLessonName.trim() || !editingLessonId) return;
    
    setLessons(prev => ({
      ...prev,
      [editingLessonId]: {
        ...prev[editingLessonId],
        name: editingLessonName
      }
    }));
    
    setEditingLessonId(null);
    setEditingLessonName('');
  };

  const cancelEditingLesson = () => {
    setEditingLessonId(null);
    setEditingLessonName('');
  };

  const startMatchGame = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);
    const matchPairs = [];
    shuffled.forEach(card => {
      matchPairs.push({ id: `${card.id}-front`, text: card.front, pairId: card.id, type: 'front' });
      matchPairs.push({ id: `${card.id}-back`, text: card.back, pairId: card.id, type: 'back' });
    });
    setMatchCards(matchPairs.sort(() => Math.random() - 0.5));
    setSelectedMatch([]);
    setMatchedPairs([]);
    setMode('match');
  };

  const handleMatchClick = (card) => {
    if (matchedPairs.includes(card.pairId)) return;
    if (selectedMatch.find(s => s.id === card.id)) return;
    
    const newSelected = [...selectedMatch, card];
    setSelectedMatch(newSelected);
    
    if (newSelected.length === 2) {
      if (newSelected[0].pairId === newSelected[1].pairId) {
        setMatchedPairs([...matchedPairs, newSelected[0].pairId]);
        setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        if (matchedPairs.length + 1 === matchCards.length / 2) {
          setShowConfetti(true);
        }
        setTimeout(() => setSelectedMatch([]), 500);
      } else {
        setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        setTimeout(() => setSelectedMatch([]), 1000);
      }
    }
  };

  const startMcqGame = () => {
    setMcqScore(0);
    setMcqTotal(0);
    setMode('mcq');
    nextMcqQuestion();
  };

  const nextMcqQuestion = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const question = shuffled[0];
    const wrongAnswers = shuffled.slice(1, 4).map(c => c.back);
    const allOptions = [question.back, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    setMcqQuestion(question);
    setMcqOptions(allOptions);
    setMcqAnswer(null);
  };

  const handleMcqAnswer = (answer) => {
    setMcqAnswer(answer);
    setMcqTotal(mcqTotal + 1);
    
    if (answer === mcqQuestion.back) {
      setMcqScore(mcqScore + 1);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    
    setTimeout(() => {
      setMcqAnswer(null);
      nextMcqQuestion();
    }, 1500);
  };

  const startTypeGame = () => {
    setTypeScore(0);
    setTypeTotal(0);
    setMode('type');
    nextTypeQuestion();
  };

  const nextTypeQuestion = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setTypeQuestion(shuffled[0]);
    setTypeInput('');
    setTypeResult(null);
  };

  const handleTypeSubmit = () => {
    if (!typeInput.trim()) return;
    
    setTypeTotal(typeTotal + 1);
    
    const isCorrect = typeInput.trim().toLowerCase() === typeQuestion.back.toLowerCase();
    setTypeResult(isCorrect);
    
    if (isCorrect) {
      setTypeScore(typeScore + 1);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    
    setTimeout(() => {
      nextTypeQuestion();
    }, 1500);
  };

  const flipCard = () => setIsFlipped(!isFlipped);

  const rateCard = (quality) => {
    if (!currentCard) return;
    
    const card = currentCard;
    const currentDueCards = [...dueCards];
    let newInterval = card.interval;
    let newEaseFactor = card.easeFactor;

    if (quality >= 3) {
      newInterval = quality === 3 ? card.interval * 1.2 : quality === 4 ? card.interval * 2 : card.interval * 2.5;
      newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      setStats(prev => ({ ...prev, studied: prev.studied + 1, correct: prev.correct + 1 }));
    } else {
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
      setStats(prev => ({ ...prev, studied: prev.studied + 1, incorrect: prev.incorrect + 1 }));
    }

    const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;
    setCards(cards.map(c => c.id === card.id ? { ...c, interval: newInterval, easeFactor: newEaseFactor, nextReview } : c));
    setIsFlipped(false);
    
    if (currentIndex >= currentDueCards.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const addCard = () => {
    if (newFront.trim() && newBack.trim()) {
      const newCard = {
        id: Date.now(),
        front: newFront,
        back: newBack,
        nextReview: Date.now(),
        interval: 1,
        easeFactor: 2.5
      };
      setCards([...cards, newCard]);
      setNewFront('');
      setNewBack('');
    }
  };

  const deleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const resetProgress = () => {
    setCards(cards.map(c => ({ ...c, nextReview: Date.now(), interval: 1, easeFactor: 2.5 })));
    setStats({ studied: 0, correct: 0, incorrect: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-32 left-1/2 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 1}s`
              }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-bounce-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Créer une Nouvelle Leçon</h2>
            <input
              type="text"
              value={newLessonName}
              onChange={(e) => setNewLessonName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewLesson()}
              placeholder="Nom de la leçon..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={createNewLesson}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 font-medium"
              >
                Créer
              </button>
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setNewLessonName('');
                }}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all transform hover:scale-105 font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          opacity: 0;
          animation: slideIn 0.3s ease-out forwards;
        }
        .flip-card {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flip-card.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-content {
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          opacity: 0;
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8 animate-slide-in">
          <div className="flex items-center gap-3">
            {mode !== 'menu' && (
              <button
                onClick={() => setMode('menu')}
                className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 font-medium shadow flex items-center gap-2"
              >
                ← Menu
              </button>
            )}
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Study Quest </h1>
          </div>
        </div>

        {mode === 'menu' && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 animate-slide-in">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-800">Vos Leçons</h2>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <button
                    onClick={exportData}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                  >
                    <Upload className="w-4 h-4" />
                    Importer
                  </button>
                  <button
                    onClick={() => setShowLessonModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle Leçon
                  </button>
                </div>
              </div>
              <div className={`grid gap-3 ${Object.keys(lessons).length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {Object.entries(lessons).map(([id, lesson]) => (
                  <div
                    key={id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentLessonId === id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => switchLesson(id)}
                        onDoubleClick={() => startEditingLesson(id, lesson.name)}
                      >
                        {editingLessonId === id ? (
                          <input
                            type="text"
                            value={editingLessonName}
                            onChange={(e) => setEditingLessonName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveEditingLesson();
                              if (e.key === 'Escape') cancelEditingLesson();
                            }}
                            onBlur={saveEditingLesson}
                            className="w-full px-2 py-1 border border-indigo-500 rounded font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h3 className="font-bold text-gray-800 mb-1">{lesson.name}</h3>
                        )}
                        <p className="text-sm text-gray-600">{lesson.cards.length} cartes</p>
                      </div>
                      <div className="flex gap-1">
                        {currentLessonId === id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMode('manage');
                              }}
                              className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-all"
                              title="Gérer les Cartes"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {Object.keys(lessons).length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteLesson(id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                                title="Supprimer la Leçon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-slide-in">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Choisissez Votre Mode de Jeu</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('flashcards')}
                    className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
                  >
                    <Zap className="w-12 h-12 mb-3 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Cartes Classiques</h3>
                    <p className="text-blue-100 text-sm">Apprentissage par répétition espacée</p>
                  </button>

                  <button
                    onClick={startMatchGame}
                    className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
                  >
                    <Target className="w-12 h-12 mb-3 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Jeu d'Association</h3>
                    <p className="text-purple-100 text-sm">Associez les questions aux réponses</p>
                  </button>

                  <button
                    onClick={startMcqGame}
                    className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
                  >
                    <CheckCircle className="w-12 h-12 mb-3 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Choix Multiple</h3>
                    <p className="text-green-100 text-sm">Choisissez la bonne réponse rapidement</p>
                  </button>

                  <button
                    onClick={startTypeGame}
                    className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg"
                  >
                    <Gamepad2 className="w-12 h-12 mb-3 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Défi de Frappe</h3>
                    <p className="text-orange-100 text-sm">Tapez la bonne réponse de mémoire</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('manage')}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 animate-slide-in"
                >
                  <Edit className="w-10 h-10 text-indigo-600 mb-2 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-800">Gérer les Cartes</h3>
                </button>

                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg animate-slide-in flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Cartes</p>
                    <p className="text-4xl font-bold text-indigo-600">{cards.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-in">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="font-bold text-gray-800">Vos Statistiques</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="transform hover:scale-110 transition-transform">
                    <div className="text-3xl font-bold text-indigo-600">{stats.studied}</div>
                    <div className="text-sm text-gray-600">Étudiées</div>
                  </div>
                  <div className="transform hover:scale-110 transition-transform">
                    <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
                    <div className="text-sm text-gray-600">Correctes</div>
                  </div>
                  <div className="transform hover:scale-110 transition-transform">
                    <div className="text-3xl font-bold text-red-600">{stats.incorrect}</div>
                    <div className="text-sm text-gray-600">Incorrectes</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'flashcards' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-slide-in" key={`flashcards-${animationKey}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div className="text-sm text-gray-600">
                Cartes à réviser : <span className="font-bold text-indigo-600">{dueCards.length}</span>
              </div>
            </div>

            {dueCards.length === 0 ? (
              <div className="text-center py-16 animate-bounce-in">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tout est à jour !</h2>
                <button
                  onClick={resetProgress}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                >
                  Réviser Toutes les Cartes à Nouveau
                </button>
              </div>
            ) : currentCard ? (
              <>
                <div className="perspective-1000">
                  <div
                    onClick={flipCard}
                    className={`flip-card bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-12 min-h-64 flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 shadow-xl relative ${isFlipped ? 'flipped' : ''}`}
                  >
                    <div className="flip-card-content absolute inset-0 flex items-center justify-center p-12">
                      <p className={`text-white text-2xl text-center font-medium ${isFlipped ? 'invisible' : ''}`}>
                        {currentCard.front}
                      </p>
                    </div>
                    <div className="flip-card-content flip-card-back absolute inset-0 flex items-center justify-center p-12">
                      <p className={`text-white text-2xl text-center font-medium ${!isFlipped ? 'invisible' : ''}`}>
                        {currentCard.back}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4 mb-6 text-sm text-gray-600">
                  Cliquez sur la carte pour la retourner
                </div>

                {isFlipped && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 animate-slide-in">
                    <button onClick={() => rateCard(1)} className="px-2 sm:px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all transform hover:scale-110 font-medium text-sm sm:text-base">Encore</button>
                    <button onClick={() => rateCard(2)} className="px-2 sm:px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all transform hover:scale-110 font-medium text-sm sm:text-base">Difficile</button>
                    <button onClick={() => rateCard(3)} className="px-2 sm:px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all transform hover:scale-110 font-medium text-sm sm:text-base">Bien</button>
                    <button onClick={() => rateCard(4)} className="px-2 sm:px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-110 font-medium text-sm sm:text-base">Facile</button>
                    <button onClick={() => rateCard(5)} className="px-2 sm:px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-110 font-medium text-sm sm:text-base col-span-2 sm:col-span-1">Parfait</button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {mode === 'match' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-slide-in" key={`match-${animationKey}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Associez les Paires !</h2>
              <div className="text-base sm:text-lg font-bold text-indigo-600">
                {matchedPairs.length} / {matchCards.length / 2} associées
              </div>
            </div>

            {matchedPairs.length === matchCards.length / 2 ? (
              <div className="text-center py-16 animate-bounce-in">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Association Parfaite !</h2>
                <button
                  onClick={startMatchGame}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105"
                >
                  Rejouer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {matchCards.map((card, idx) => {
                  const isMatched = matchedPairs.includes(card.pairId);
                  const isSelected = selectedMatch.find(s => s.id === card.id);
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleMatchClick(card)}
                      disabled={isMatched}
                      className={`p-4 rounded-lg font-medium transition-all transform hover:scale-105 animate-bounce-in ${
                        isMatched
                          ? 'bg-green-100 text-green-800 opacity-50'
                          : isSelected
                          ? 'bg-purple-500 text-white scale-105 shadow-lg'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md'
                      }`}
                      style={{animationDelay: `${idx * 0.05}s`}}
                    >
                      {card.text}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {mode === 'mcq' && mcqQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-slide-in" key={`mcq-${animationKey}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Choix Multiple</h2>
              <div className="text-base sm:text-lg font-bold text-green-600">
                Score: {mcqScore} / {mcqTotal}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 sm:p-8 mb-6 animate-bounce-in shadow-xl">
              <p className="text-white text-lg sm:text-xl text-center font-medium">
                {mcqQuestion.front}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mcqOptions.map((option, idx) => {
                const isCorrect = option === mcqQuestion.back;
                const isSelected = mcqAnswer === option;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleMcqAnswer(option)}
                    disabled={mcqAnswer !== null}
                    className={`p-6 rounded-lg font-medium transition-all transform hover:scale-105 animate-slide-in ${
                      mcqAnswer === null
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-lg'
                        : isSelected && isCorrect
                        ? 'bg-green-500 text-white scale-105 shadow-xl'
                        : isSelected && !isCorrect
                        ? 'bg-red-500 text-white scale-95'
                        : isCorrect
                        ? 'bg-green-300 text-green-900'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'type' && typeQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-slide-in" key={`type-${animationKey}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Défi de Frappe</h2>
              <div className="text-base sm:text-lg font-bold text-orange-600">
                Score: {typeScore} / {typeTotal}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 sm:p-8 mb-6 animate-bounce-in shadow-xl">
              <p className="text-white text-lg sm:text-xl text-center font-medium">
                {typeQuestion.front}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && typeResult === null && handleTypeSubmit()}
                disabled={typeResult !== null}
                placeholder="Tapez votre réponse..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                autoFocus
              />
              
              {typeResult !== null && (
                <div className={`p-4 rounded-lg animate-bounce-in ${typeResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="font-bold">{typeResult ? '✓ Correct !' : '✗ Incorrect'}</p>
                  {!typeResult && <p>La réponse était : {typeQuestion.back}</p>}
                </div>
              )}
              
              {typeResult === null && (
                <button
                  onClick={handleTypeSubmit}
                  className="w-full px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
                >
                  Soumettre la Réponse
                </button>
              )}
            </div>
          </div>
        )}

        {mode === 'manage' && (
          <div className="space-y-6" key={`manage-${animationKey}`}>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-slide-in">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Ajouter une Nouvelle Carte</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    rows="2"
                    placeholder="Entrez votre question..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réponse</label>
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    rows="2"
                    placeholder="Entrez la réponse..."
                  />
                </div>
              </div>
              <button
                onClick={addCard}
                className="mt-4 w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Ajouter une Carte
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 animate-slide-in" style={{animationDelay: '0.1s'}}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Vos Cartes ({cards.length})</h2>
                <button
                  onClick={resetProgress}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 font-medium flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
              <div className="space-y-3">
                {cards.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucune carte pour le moment. Ajoutez votre première carte ci-dessus !</p>
                ) : (
                  cards.map((card, idx) => (
                    <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all hover:shadow-md animate-slide-in" style={{animationDelay: `${idx * 0.05}s`}}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 mb-1">{card.front}</div>
                          <div className="text-sm text-gray-600">{card.back}</div>
                        </div>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all transform hover:scale-110 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}