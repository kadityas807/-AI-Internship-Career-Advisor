import { doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export const processAgentActions = async (text: string, userId: string, db: Firestore) => {
  let outputText = text;
  let actionsTaken = 0;
  const messages: string[] = [];

  // 1. SKILL EXTRACT
  const skillRegex = /<SKILL_EXTRACT>\s*(\[[\s\S]*?\])\s*<\/SKILL_EXTRACT>/i;
  const skillMatch = outputText.match(skillRegex);
  if (skillMatch) {
    try {
      const extractedSkills = JSON.parse(skillMatch[1]);
      const addPromises = extractedSkills.map((sk: any) => 
        setDoc(doc(db, 'users', userId, 'skills', uuidv4()), {
          uid: userId,
          name: sk.name,
          category: sk.category || 'Technical',
          proficiency: sk.proficiency || 3,
          evidence: sk.evidence || 'Analyzed by AI Mentor',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true })
      );
      await Promise.all(addPromises);
      outputText = outputText.replace(skillRegex, '');
      messages.push(`✨ Added **${extractedSkills.length} skills** to your ledger.`);
      actionsTaken++;
    } catch (e) {
      console.error('Failed to parse SKILL_EXTRACT', e);
    }
  }

  // 2. CREATE PROJECT
  const projectRegex = /<CREATE_PROJECT>\s*(\[[\s\S]*?\])\s*<\/CREATE_PROJECT>/i;
  const projectMatch = outputText.match(projectRegex);
  if (projectMatch) {
    try {
      const extractedProjects = JSON.parse(projectMatch[1]);
      const addPromises = extractedProjects.map((proj: any) => 
        setDoc(doc(db, 'users', userId, 'projects', uuidv4()), {
          uid: userId,
          name: proj.name,
          description: proj.description || '',
          techStack: proj.techStack || [],
          role: proj.role || 'Full Stack Developer',
          outcome: proj.outcome || 'Successfully developed and deployed',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true })
      );
      await Promise.all(addPromises);
      outputText = outputText.replace(projectRegex, '');
      messages.push(`🚀 Added **${extractedProjects.length} projects** to your portfolio.`);
      actionsTaken++;
    } catch (e) {
      console.error('Failed to parse CREATE_PROJECT', e);
    }
  }

  // 3. UPDATE APP (Applications)
  const appRegex = /<UPDATE_APP>\s*(\[[\s\S]*?\])\s*<\/UPDATE_APP>/i;
  const appMatch = outputText.match(appRegex);
  if (appMatch) {
    try {
      const extractedApps = JSON.parse(appMatch[1]);
      const addPromises = extractedApps.map((app: any) => 
        setDoc(doc(db, 'users', userId, 'applications', uuidv4()), {
          uid: userId,
          company: app.company,
          role: app.role || 'Software Engineer',
          status: app.status || 'Applied',
          date: new Date().toISOString().split('T')[0],
          notes: app.notes || 'Added by AI Mentor',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true }) // Using random uuidv4 means the AI is ALWAYS creating new entries for simplicity, rather than querying to resolve updating existing ones.
      );
      await Promise.all(addPromises);
      outputText = outputText.replace(appRegex, '');
      messages.push(`🏢 Tracked **${extractedApps.length} job applications** on your board.`);
      actionsTaken++;
    } catch (e) {
      console.error('Failed to parse UPDATE_APP', e);
    }
  }

  // Append summary if actions were taken
  if (actionsTaken > 0) {
    outputText += `\n\n---\n**Autonomous Actions Performed:**\n` + messages.join('\n');
  }

  return outputText;
};
