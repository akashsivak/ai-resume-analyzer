import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Summary from "./Summary";

export const meta = () => ([
  {title: 'Resumind | Auth'},
  {name:'description',content: 'Detailed overview of your resume'},
])

const Resume = () => {
  const {auth,isLoading,fs,kv} = usePuterStore();
  const {id} = useParams();
  const [imageUrl,setImageUrl] = useState('');
  const [resumeUrl,setResumeUrl] = useState('');
  const [feedback,setFeedback] = useState<Feedback | null>(null);
  const navigate= useNavigate();

  // redirect if not logged in
  useEffect(()=>{
    if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  },[isLoading]);

  // load resume + feedback
  useEffect(()=>{
    const loadResume= async()=>{
      try {
        const resume = await kv.get(`resume:${id}`);
        console.log("Loaded KV raw:", resume);

        if(!resume) return;
        const data = JSON.parse(resume);
        console.log("Parsed data:", data);

        const resumeBlob = await fs.read(data.resumePath);
        if(resumeBlob){
          const pdfBlob = new Blob([resumeBlob],{type:'application/pdf'});
          setResumeUrl(URL.createObjectURL(pdfBlob));
        }

        const imageBlob = await fs.read(data.imagePath);
        if(imageBlob){
          setImageUrl(URL.createObjectURL(imageBlob));
        }

        setFeedback(data.feedback ?? "");
        console.log("Feedback set:", data.feedback);
      } catch (err) {
        console.error("Error loading resume:", err);
      }
    }
    loadResume();
  },[id]);

  return (
   <main className="!pt-0">
     <nav className="resume-nav">
       <Link to="/" className="back-button">
         <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
         <span className="text-gray-800 text-sm font-semibold">Back to homepage</span>
       </Link>
     </nav>

     <div className="flex flex-row w-full max-lg:flex-col-reverse">
       <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
         
         <h2 className="text-4xl text-black font-bold mb-6">Resume review</h2>
{feedback ? (
  <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
    
     <Summary feedback={feedback} /> 
     <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
     <Details feedback={feedback} />
  </div>

):(
  <img src="/images/resume-scan.gif" className="w-full" alt="" />
)}

         {imageUrl && resumeUrl && (
           <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit mt-6">
             <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
               <img 
                 src={imageUrl}
                 className="w-full h-full object-contain rounded-2xl"
                 title="resume"
               />
             </a>
           </div>
         )}
       </section>
     </div>   
   </main>
  )
}

export default Resume;
