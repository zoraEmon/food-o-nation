import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgramCard from "@/components/features/programs/ProgramCard";

export default function ProgramsPage() {
  
  const programs = [
    {
      title: "Community Pantry",
      status: "Active" as const,
      description: "A localized food sharing initiative allowing community members to donate and take food based on their needs, fostering neighborhood support."
    },
    {
      title: "School Lunch Program",
      status: "Active" as const,
      description: "Providing nutritious daily meals to public school students in low-income areas to combat malnutrition and improve learning outcomes."
    },
    {
      title: "Disaster Relief 2023",
      status: "Completed" as const,
      description: "Rapid response food distribution for families affected by Typhoon Egay, serving over 5,000 households in Northern Luzon."
    },
    {
        title: "Barangay Health Aid",
        status: "Active" as const,
        description: "Supplemental feeding for expectant mothers and children under 5 years old in partner barangays."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-6">
            
            {/* Header */}
            <div className="mb-12 text-center md:text-left">
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary dark:text-white mb-4">
                    Our Programs
                </h1>
                <p className="font-sans text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                    View our active initiatives. If you are a beneficiary in need of assistance, 
                    please look for the <strong>Apply</strong> button on active programs.
                </p>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((prog, index) => (
                    <ProgramCard 
                        key={index}
                        title={prog.title}
                        description={prog.description}
                        status={prog.status}
                    />
                ))}
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}