import { GoogleGenAI, Type } from "@google/genai";
import { Lead, CreatorSettings } from "../types";

// FIX: Initialize GoogleGenAI with a named apiKey parameter from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a summary and suggested next steps for a given lead.
 * @param lead The lead object.
 * @returns A string containing the summary and next steps.
 */
export async function getLeadSummary(lead: Lead): Promise<string> {
  const prompt = `
    Analyze the following sales lead and provide a concise summary and 3 actionable next steps.
    Format the output as markdown.

    **Lead Information:**
    - **Company:** ${lead.companyName}
    - **Contact:** ${lead.contactName} (${lead.email}, ${lead.phone})
    - **Stage:** ${lead.stage}
    - **Value:** $${lead.value.toLocaleString()}
    - **Last Contacted:** ${new Date(lead.lastContacted).toDateString()}
    - **Notes:** ${lead.notes}

    **Output:**
    ### Summary
    [Your summary here]

    ### Suggested Next Steps
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
  `;

  try {
    // FIX: Use ai.models.generateContent to query the Gemini API according to guidelines.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use a suitable model for text tasks.
      contents: prompt,
    });
    // FIX: Access the generated text directly from the response.text property.
    return response.text;
  } catch (error) {
    console.error("Error generating lead summary:", error);
    return "Error: Could not generate AI summary. Please check your API key and network connection.";
  }
}

/**
 * Generates a pitch email for a given lead, personalized with creator settings.
 * @param lead The lead object.
 * @param settings The creator's settings object.
 * @returns An object containing the email subject and body.
 */
export async function generatePitchEmail(lead: Lead, settings: CreatorSettings): Promise<{ subject: string; body: string; }> {
    const leadFirstName = lead.contactName.split(' ')[0];
    const prompt = `
    You are a content creator drafting a professional and compelling pitch email to a potential client.
    Write this email in the first person ("I"), representing the creator's brand identity provided below.
    Address the contact by their first name only.
    The email must be personalized. The goal is to get a response and book a meeting.

    **Creator's Brand Information (Your Persona):**
    - **My Name:** ${settings.fullName || 'The Creator'}
    - **My Title/Identity:** ${settings.professionalTitle}
    - **My Niche:** ${settings.niche}
    - **My Primary Social Media Networks:** ${settings.socialMediaNetworks.join(', ')}
    - **My Brand Voice Keywords:** ${settings.brandVoiceKeywords}
    - **My Unique Selling Proposition:** ${settings.usp}
    - **My Bio/Pitch:** ${settings.bio}
    - **My Key Stats:** ${settings.totalFollowers} followers.
    - **My Past Collaborations:** ${settings.pastCollaborations}
    - **My Preferred Signature:** ${settings.signatureStyle}

    **Lead Information:**
    - **Company:** ${lead.companyName}
    - **Contact First Name:** ${leadFirstName}
    - **Notes about this lead:** ${lead.notes}

    Return the output as a JSON object with two keys: "subject" and "body".
    The body should be a string with newline characters (\\n) for paragraphs.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                },
                required: ["subject", "body"],
            },
        },
    });

    const jsonText = response.text.trim();
    // In case the model returns markdown with JSON, extract just the JSON part.
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    const parsableText = jsonMatch ? jsonMatch[1] : jsonText;
    
    return JSON.parse(parsableText);
  } catch (error) {
    console.error("Error generating pitch email:", error);
    return {
      subject: "Error",
      body: "Could not generate pitch email. Please check your API key and try again.",
    };
  }
}

/**
 * Generates an invoice reminder email for a given lead.
 * @param lead The lead object.
 * @param settings The creator's settings object.
 * @returns An object containing the email subject and body.
 */
export async function generateInvoiceReminderEmail(lead: Lead, settings: CreatorSettings): Promise<{ subject: string; body: string; }> {
    if (!lead.invoiceDueDate) {
        return { subject: "Error", body: "Cannot generate reminder: Invoice due date is not set." };
    }

    const today = new Date();
    const dueDate = new Date(lead.invoiceDueDate);
    const isOverdue = today > dueDate;
    
    const status = isOverdue ? 'is past due' : 'is approaching its due date';
    const invoiceLinkText = lead.invoiceLink ? `You can view the invoice here: ${lead.invoiceLink}` : '';
    const toneInstruction = isOverdue 
        ? "The tone should be firm but polite, clearly stating that the payment is overdue."
        : "The tone should be a friendly and professional reminder.";
    const leadFirstName = lead.contactName.split(' ')[0];

    const prompt = `
        You are a content creator writing a short, simple, and professional invoice reminder email. Write from the first-person perspective ("I").
        Address the contact by their first name only.

        **Context:**
        - The invoice for ${lead.companyName} ${status}.
        - Due Date: ${dueDate.toLocaleDateString()}
        - ${invoiceLinkText}
        - ${toneInstruction}

        **My Info:**
        - My Name: ${settings.fullName}
        - My Signature: ${settings.signatureStyle}

        **Lead Info:**
        - Contact First Name: ${leadFirstName}

        Please generate a suitable subject line and a concise email body. If the invoice link is provided, include it in the body.

        Return the output as a JSON object with "subject" and "body" keys. The body should be a string with newline characters (\\n) for paragraphs.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    },
                    required: ["subject", "body"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        const parsableText = jsonMatch ? jsonMatch[1] : jsonText;
        
        return JSON.parse(parsableText);
    } catch (error) {
        console.error("Error generating invoice reminder email:", error);
        return {
          subject: "Error Generating Email",
          body: "Could not generate the invoice reminder email. Please check your API key and try again.",
        };
    }
}