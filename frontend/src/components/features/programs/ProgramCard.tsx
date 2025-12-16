import { Button } from "@/components/ui/Button";

interface ProgramCardProps {
  title: string;
  description: string;
  status: "Active" | "Completed";
  allowApply?: boolean;
  onApply?: () => void;
  onBlocked?: () => void;
}

export default function ProgramCard({ title, description, status, allowApply = false, onApply, onBlocked }: ProgramCardProps) {
  return (
    <div className="group flex flex-col h-full bg-white dark:bg-[#0a291a] border border-primary/20 hover:border-secondary shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
      
      {/* Image Placeholder */}
      <div className="relative w-full h-56 bg-[#f4f1ea] dark:bg-black/40 flex items-center justify-center overflow-hidden border-b border-primary/10">
         <svg className="w-full h-full text-primary/10 dark:text-white/5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
         </svg>
         
         <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
           status === 'Active' 
             ? 'bg-secondary text-black' 
             : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
         }`}>
           {status}
         </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-heading text-2xl font-bold text-primary dark:text-[#e2e8f0] mb-3 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        
        <p className="font-sans text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1 text-justify">
          {description}
        </p>

        {/* Actions: Apply (Beneficiary) & Partner */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button 
            className="w-full bg-primary text-white hover:bg-[#00331f] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={status !== 'Active' || !allowApply}
            onClick={() => {
              if (status !== 'Active') return;
              if (!allowApply) {
                onBlocked?.();
                return;
              }
              onApply?.();
            }}
          >
            {status === 'Active' ? 'Apply' : 'Closed'}
          </Button>
          
          <Button variant="outline" className="w-full border-primary text-primary hover:bg-secondary hover:border-secondary hover:text-black dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black">
            Partner
          </Button>
        </div>
      </div>
    </div>
  );
}