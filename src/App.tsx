import { useState, useRef, useEffect } from 'react'

// Drug database with common medications
const DRUG_DATABASE = [
  'Acetaminophen', 'Adderall', 'Albuterol', 'Alprazolam', 'Amitriptyline',
  'Amlodipine', 'Amoxicillin', 'Aspirin', 'Atenolol', 'Atorvastatin',
  'Azithromycin', 'Benzonatate', 'Bupropion', 'Buspirone', 'Carvedilol',
  'Cephalexin', 'Cetirizine', 'Ciprofloxacin', 'Citalopram', 'Clindamycin',
  'Clonazepam', 'Clopidogrel', 'Cyclobenzaprine', 'Diazepam', 'Diclofenac',
  'Diltiazem', 'Diphenhydramine', 'Doxycycline', 'Duloxetine', 'Escitalopram',
  'Esomeprazole', 'Fluoxetine', 'Fluticasone', 'Gabapentin', 'Glipizide',
  'Hydrochlorothiazide', 'Hydrocodone', 'Hydroxyzine', 'Ibuprofen', 'Insulin',
  'Lamotrigine', 'Lansoprazole', 'Levothyroxine', 'Lisinopril', 'Lithium',
  'Loratadine', 'Lorazepam', 'Losartan', 'Meloxicam', 'Metformin',
  'Methadone', 'Methocarbamol', 'Metoprolol', 'Metronidazole', 'Montelukast',
  'Morphine', 'Naproxen', 'Omeprazole', 'Ondansetron', 'Oxycodone',
  'Pantoprazole', 'Paroxetine', 'Penicillin', 'Pravastatin', 'Prednisone',
  'Pregabalin', 'Promethazine', 'Propranolol', 'Quetiapine', 'Ranitidine',
  'Rosuvastatin', 'Sertraline', 'Simvastatin', 'Spironolactone', 'Sulfamethoxazole',
  'Tamsulosin', 'Tizanidine', 'Topiramate', 'Tramadol', 'Trazodone',
  'Valacyclovir', 'Venlafaxine', 'Warfarin', 'Zolpidem'
]

// Interaction database (simplified for demonstration)
const INTERACTIONS: Record<string, Record<string, { severity: 'severe' | 'moderate' | 'mild' | 'none', description: string, recommendation: string }>> = {
  'Citalopram': {
    'Tramadol': { severity: 'severe', description: 'Increased risk of serotonin syndrome and seizures. Both drugs increase serotonin levels.', recommendation: 'Avoid combination. If necessary, monitor closely for symptoms of serotonin syndrome.' },
    'Naproxen': { severity: 'moderate', description: 'Increased risk of gastrointestinal bleeding. SSRIs may potentiate antiplatelet effects of NSAIDs.', recommendation: 'Use with caution. Consider gastroprotective agents.' },
    'Warfarin': { severity: 'severe', description: 'Increased risk of bleeding. Citalopram inhibits platelet aggregation and may increase warfarin levels.', recommendation: 'Monitor INR closely. Consider alternative antidepressant.' },
    'Lithium': { severity: 'moderate', description: 'May increase lithium levels and risk of serotonin syndrome.', recommendation: 'Monitor lithium levels and watch for signs of toxicity.' },
    'Omeprazole': { severity: 'moderate', description: 'Omeprazole may increase citalopram plasma concentrations.', recommendation: 'Consider dose adjustment. Monitor for increased side effects.' }
  },
  'Naproxen': {
    'Warfarin': { severity: 'severe', description: 'Significantly increased risk of gastrointestinal and other bleeding.', recommendation: 'Avoid combination if possible. Monitor INR closely.' },
    'Lisinopril': { severity: 'moderate', description: 'NSAIDs may reduce antihypertensive effect and increase risk of kidney injury.', recommendation: 'Monitor blood pressure and kidney function.' },
    'Aspirin': { severity: 'moderate', description: 'Increased risk of gastrointestinal bleeding. Naproxen may interfere with aspirin\'s cardioprotective effects.', recommendation: 'If using aspirin for cardioprotection, take aspirin first.' },
    'Methotrexate': { severity: 'severe', description: 'NSAIDs can increase methotrexate toxicity by reducing its elimination.', recommendation: 'Avoid combination or use extreme caution with monitoring.' },
    'Lithium': { severity: 'moderate', description: 'NSAIDs may increase lithium levels by reducing renal clearance.', recommendation: 'Monitor lithium levels closely.' }
  },
  'Warfarin': {
    'Aspirin': { severity: 'severe', description: 'Major increase in bleeding risk from additive anticoagulant effects.', recommendation: 'Avoid unless specifically indicated. Monitor for bleeding.' },
    'Ibuprofen': { severity: 'severe', description: 'Increased risk of bleeding. NSAIDs also inhibit platelet function.', recommendation: 'Use acetaminophen for pain if possible.' },
    'Fluconazole': { severity: 'severe', description: 'Fluconazole inhibits warfarin metabolism, significantly increasing INR.', recommendation: 'Reduce warfarin dose and monitor INR frequently.' },
    'Metronidazole': { severity: 'severe', description: 'Metronidazole inhibits warfarin metabolism, increasing anticoagulant effect.', recommendation: 'Monitor INR closely. May need warfarin dose reduction.' }
  },
  'Metformin': {
    'Alcohol': { severity: 'severe', description: 'Increased risk of lactic acidosis, especially with heavy alcohol use.', recommendation: 'Limit alcohol consumption.' },
    'Contrast Dye': { severity: 'moderate', description: 'Risk of lactic acidosis when used with iodinated contrast media.', recommendation: 'Hold metformin before and 48 hours after contrast procedures.' }
  },
  'Sertraline': {
    'Tramadol': { severity: 'severe', description: 'Risk of serotonin syndrome. Both drugs increase serotonergic activity.', recommendation: 'Avoid combination. Use alternative pain management.' },
    'MAO Inhibitors': { severity: 'severe', description: 'Life-threatening serotonin syndrome risk.', recommendation: 'Contraindicated. Allow 14-day washout period.' },
    'Warfarin': { severity: 'moderate', description: 'Increased bleeding risk due to platelet effects.', recommendation: 'Monitor for signs of bleeding.' }
  },
  'Lisinopril': {
    'Potassium': { severity: 'moderate', description: 'Risk of hyperkalemia. ACE inhibitors reduce potassium excretion.', recommendation: 'Monitor potassium levels regularly.' },
    'Spironolactone': { severity: 'moderate', description: 'Additive hyperkalemia risk.', recommendation: 'Monitor potassium levels closely.' }
  },
  'Simvastatin': {
    'Amiodarone': { severity: 'severe', description: 'Increased risk of myopathy and rhabdomyolysis.', recommendation: 'Limit simvastatin dose to 20mg daily.' },
    'Clarithromycin': { severity: 'severe', description: 'Increased statin levels and risk of muscle damage.', recommendation: 'Suspend simvastatin during clarithromycin therapy.' },
    'Grapefruit': { severity: 'moderate', description: 'Grapefruit inhibits statin metabolism, increasing levels.', recommendation: 'Avoid grapefruit or grapefruit juice.' }
  },
  'Alprazolam': {
    'Oxycodone': { severity: 'severe', description: 'Profound sedation, respiratory depression, coma, and death.', recommendation: 'Avoid concurrent use. If necessary, use lowest effective doses.' },
    'Alcohol': { severity: 'severe', description: 'Enhanced CNS depression. Risk of respiratory depression.', recommendation: 'Avoid alcohol while taking benzodiazepines.' },
    'Ketoconazole': { severity: 'moderate', description: 'Increased alprazolam levels due to CYP3A4 inhibition.', recommendation: 'Consider dose reduction.' }
  }
}

function getInteraction(drug1: string, drug2: string) {
  const d1 = drug1.charAt(0).toUpperCase() + drug1.slice(1).toLowerCase()
  const d2 = drug2.charAt(0).toUpperCase() + drug2.slice(1).toLowerCase()
  
  if (INTERACTIONS[d1]?.[d2]) return INTERACTIONS[d1][d2]
  if (INTERACTIONS[d2]?.[d1]) return INTERACTIONS[d2][d1]
  
  return null
}

interface DrugInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  drugNumber: 1 | 2
}

function DrugInput({ label, value, onChange, placeholder, drugNumber }: DrugInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value.length >= 2 && isFocused) {
      const filtered = DRUG_DATABASE.filter(drug =>
        drug.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [value, isFocused])

  return (
    <div className="relative flex-1">
      <div className={`drug-input rounded-2xl p-6 ${isFocused ? 'glow-amber' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="hexagon w-8 h-8 flex items-center justify-center text-xs font-bold" 
               style={{ background: 'linear-gradient(145deg, var(--amber-glow), var(--amber-dim))' }}>
            {drugNumber}
          </div>
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xl font-display font-light outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        
        <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, var(--amber-glow), transparent)' }} />
        
        {/* Molecular decoration */}
        <div className="absolute -right-2 -top-2 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="20" cy="20" r="4" stroke="var(--amber-glow)" strokeWidth="1" />
            <circle cx="40" cy="15" r="3" stroke="var(--amber-glow)" strokeWidth="1" />
            <circle cx="35" cy="40" r="5" stroke="var(--amber-glow)" strokeWidth="1" />
            <line x1="23" y1="18" x2="37" y2="16" stroke="var(--amber-glow)" strokeWidth="1" />
            <line x1="22" y1="23" x2="32" y2="37" stroke="var(--amber-glow)" strokeWidth="1" />
          </svg>
        </div>
      </div>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div 
          className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(212, 165, 68, 0.2)' }}
        >
          {suggestions.map((drug, idx) => (
            <button
              key={drug}
              onClick={() => {
                onChange(drug)
                setSuggestions([])
              }}
              className="suggestion-item w-full px-4 py-3 text-left transition-colors flex items-center gap-3"
              style={{ 
                color: 'var(--text-primary)',
                animationDelay: `${idx * 50}ms`
              }}
            >
              <span className="text-xs" style={{ color: 'var(--amber-glow)' }}>●</span>
              {drug}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ConnectionVisual({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 md:px-8 py-4">
      <div className="relative">
        {/* Central orb */}
        <div 
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'glow-amber' : ''}`}
          style={{ 
            background: isActive 
              ? 'radial-gradient(circle, var(--amber-glow) 0%, var(--amber-dim) 100%)' 
              : 'var(--bg-tertiary)',
            border: '2px solid',
            borderColor: isActive ? 'var(--amber-bright)' : 'var(--text-muted)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--bg-primary)' : 'var(--text-muted)'} strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        
        {/* Connection lines */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 -top-8 w-px h-6 transition-all duration-500`}
          style={{ background: isActive ? 'var(--amber-glow)' : 'var(--text-muted)', opacity: isActive ? 1 : 0.3 }}
        />
        <div 
          className={`absolute left-1/2 -translate-x-1/2 -bottom-8 w-px h-6 transition-all duration-500`}
          style={{ background: isActive ? 'var(--amber-glow)' : 'var(--text-muted)', opacity: isActive ? 1 : 0.3 }}
        />
      </div>
      
      {/* Horizontal lines for desktop */}
      <div className="hidden md:flex absolute left-0 right-0 items-center pointer-events-none">
        <div className={`h-px flex-1 connection-line ${isActive ? '' : 'opacity-20'}`} />
        <div className="w-16" />
        <div className={`h-px flex-1 connection-line ${isActive ? '' : 'opacity-20'}`} />
      </div>
    </div>
  )
}

interface InteractionResult {
  severity: 'severe' | 'moderate' | 'mild' | 'none'
  description: string
  recommendation: string
}

function ResultsPanel({ result, drug1, drug2, isSearching }: { result: InteractionResult | null | undefined, drug1: string, drug2: string, isSearching: boolean }) {
  if (isSearching) {
    return (
      <div className="mt-8 p-8 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="scan-line absolute inset-x-0 h-1" style={{ background: 'linear-gradient(180deg, transparent, var(--amber-glow), transparent)' }} />
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--amber-glow)', borderTopColor: 'transparent' }} />
          <span className="font-display text-lg" style={{ color: 'var(--text-secondary)' }}>Analyzing interactions...</span>
        </div>
      </div>
    )
  }

  if (result === undefined) return null

  const severityConfig = {
    severe: { color: 'var(--danger)', label: 'SEVERE', icon: '⚠' },
    moderate: { color: 'var(--warning)', label: 'MODERATE', icon: '◆' },
    mild: { color: 'var(--caution)', label: 'MILD', icon: '●' },
    none: { color: 'var(--safe)', label: 'NO KNOWN INTERACTION', icon: '✓' }
  }

  const noInteraction = result === null
  const config = noInteraction ? severityConfig.none : severityConfig[result.severity]

  return (
    <div className="mt-8 animate-fade-in">
      <div 
        className={`p-6 md:p-8 rounded-2xl border-l-4 severity-${noInteraction ? 'none' : result.severity}`}
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <span 
                className="text-xs font-bold tracking-[0.2em] px-3 py-1 rounded-full"
                style={{ background: `${config.color}22`, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {drug1} + {drug2}
            </h3>
          </div>
          
          {/* Severity indicator */}
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div 
                key={level}
                className="w-2 h-8 rounded-full"
                style={{ 
                  background: noInteraction 
                    ? (level === 1 ? config.color : 'var(--bg-tertiary)')
                    : (level <= (result.severity === 'severe' ? 3 : result.severity === 'moderate' ? 2 : 1) 
                      ? config.color 
                      : 'var(--bg-tertiary)')
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        {noInteraction ? (
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            No known significant interaction between these medications. However, always consult with your healthcare provider or pharmacist before combining medications.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-muted)' }}>Interaction Details</h4>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {result.description}
              </p>
            </div>
            
            <div className="pt-4" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
              <h4 className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--amber-glow)' }}>Recommendation</h4>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {result.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 pt-4 flex items-start gap-2" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>ℹ</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            This information is for educational purposes only and should not replace professional medical advice. Always consult your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [result, setResult] = useState<InteractionResult | null | undefined>(undefined)
  const [isSearching, setIsSearching] = useState(false)

  const canSearch = drug1.trim().length >= 2 && drug2.trim().length >= 2

  const handleSearch = () => {
    if (!canSearch) return
    
    setIsSearching(true)
    setResult(undefined)
    
    // Simulate API call delay
    setTimeout(() => {
      const interaction = getInteraction(drug1, drug2)
      setResult(interaction)
      setIsSearching(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen molecule-bg relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none" />
      
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(212, 165, 68, 0.1) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(212, 165, 68, 0.1) 0%, transparent 70%)' }} />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="float-slow">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="12" cy="12" r="6" stroke="var(--amber-glow)" strokeWidth="1.5" fill="var(--bg-secondary)" />
                <circle cx="28" cy="12" r="4" stroke="var(--amber-glow)" strokeWidth="1.5" fill="var(--bg-secondary)" />
                <circle cx="20" cy="28" r="5" stroke="var(--amber-glow)" strokeWidth="1.5" fill="var(--bg-secondary)" />
                <line x1="16" y1="14" x2="24" y2="10" stroke="var(--amber-glow)" strokeWidth="1.5" />
                <line x1="14" y1="17" x2="17" y2="24" stroke="var(--amber-glow)" strokeWidth="1.5" />
                <line x1="26" y1="15" x2="23" y2="24" stroke="var(--amber-glow)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 glow-text" style={{ color: 'var(--text-primary)' }}>
            Drug Interaction<br />Checker
          </h1>
          
          <p className="text-sm md:text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Enter two medications below to check for potential interactions and safety recommendations.
          </p>
        </header>

        {/* Main interaction area */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-stretch relative">
            <DrugInput
              label="First Medication"
              value={drug1}
              onChange={setDrug1}
              placeholder="e.g., Citalopram"
              drugNumber={1}
            />
            
            <ConnectionVisual isActive={canSearch} />
            
            <DrugInput
              label="Second Medication"
              value={drug2}
              onChange={setDrug2}
              placeholder="e.g., Naproxen"
              drugNumber={2}
            />
          </div>

          {/* Search button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSearch}
              disabled={!canSearch || isSearching}
              className="search-button px-8 py-4 rounded-xl font-display font-semibold text-lg flex items-center gap-3"
              style={{ color: 'var(--bg-primary)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="6" />
                <line x1="12" y1="12" x2="18" y2="18" />
              </svg>
              Check Interactions
            </button>
          </div>

          {/* Results */}
          <ResultsPanel 
            result={result} 
            drug1={drug1} 
            drug2={drug2} 
            isSearching={isSearching}
          />

          {/* Example searches */}
          {result === undefined && !isSearching && (
            <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>
                Try these examples
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  ['Citalopram', 'Tramadol'],
                  ['Warfarin', 'Aspirin'],
                  ['Naproxen', 'Lisinopril'],
                  ['Alprazolam', 'Oxycodone']
                ].map(([d1, d2]) => (
                  <button
                    key={`${d1}-${d2}`}
                    onClick={() => {
                      setDrug1(d1)
                      setDrug2(d2)
                    }}
                    className="px-3 py-2 rounded-lg text-xs transition-all hover:scale-105"
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      color: 'var(--text-secondary)',
                      border: '1px solid rgba(212, 165, 68, 0.1)'
                    }}
                  >
                    {d1} + {d2}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 text-center" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Requested by <span style={{ color: 'var(--text-secondary)' }}>@RasmusLearns</span> · Built by <span style={{ color: 'var(--text-secondary)' }}>@clonkbot</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App