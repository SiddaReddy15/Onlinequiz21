import { ChevronDown, Globe } from 'lucide-react';
import { clsx } from 'clsx';

export type Language = 'javascript' | 'python' | 'java' | 'sql' | 'csharp';

interface LanguageOption {
  id: Language;
  label: string;
  template: string;
}

export const LANGUAGES: LanguageOption[] = [
  { 
    id: 'javascript', 
    label: 'JavaScript', 
    template: `// JavaScript Solution\n\nfunction solution() {\n    // Your code here\n    console.log("Hello World");\n}\n\nsolution();`
  },
  { 
    id: 'python', 
    label: 'Python', 
    template: `# Python Solution\n\ndef solution():\n    # Your code here\n    print("Hello World")\n\nif __name__ == "__main__":\n    solution()`
  },
  { 
    id: 'java', 
    label: 'Java', 
    template: `// Java Solution\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello World");\n    }\n}`
  },
  { 
    id: 'sql', 
    label: 'SQL', 
    template: `-- SQL Solution\n\nSELECT * \nFROM users \nWHERE active = true;`
  },
  { 
    id: 'csharp', 
    label: '.NET (C#)', 
    template: `// C# Solution\n\nusing System;\n\npublic class Solution {\n    public static void Main() {\n        // Your code here\n        Console.WriteLine("Hello World");\n    }\n}`
  }
];

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export const LanguageSelector = ({ selected, onSelect }: LanguageSelectorProps) => {
  const currentLang = LANGUAGES.find(l => l.id === selected) || LANGUAGES[0];

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg cursor-pointer hover:border-[#8b949e] transition-all">
        <Globe size={14} className="text-sky-400" />
        <span className="text-xs font-bold text-slate-300">{currentLang.label}</span>
        <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />
      </div>

      <div className="absolute top-full left-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        <div className="py-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className={clsx(
                "w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between",
                selected === lang.id ? "bg-sky-500/10 text-sky-400" : "text-slate-400 hover:bg-[#21262d] hover:text-white"
              )}
            >
              {lang.label}
              {selected === lang.id && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
