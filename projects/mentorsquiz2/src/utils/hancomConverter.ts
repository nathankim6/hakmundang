
import { Document, Packer } from "docx";
import { saveAs } from "file-saver";

const HANCOM_API_URL = "https://api.converter.web.hancom.com/convert";

export const convertToHWP = async (doc: Document, filename: string, format: "hwp" | "hwpx" = "hwp") => {
  try {
    // Step 1: Convert Document to binary data
    const blob = await Packer.toBlob(doc);
    
    // Step 2: Get API key from localStorage
    const apiKey = localStorage.getItem("hancom_api_key");
    
    if (!apiKey) {
      // If no API key is found, fall back to docx download with notification
      console.error("Hancom API key not found. Falling back to DOCX format.");
      saveAs(blob, `${filename}.docx`);
      return { success: false, error: "한컴 API 키가 설정되어 있지 않습니다. DOCX 형식으로 저장됩니다." };
    }
    
    // Step 3: Create FormData with the required parameters
    const formData = new FormData();
    formData.append("file", blob, "document.docx");
    formData.append("format", format); // "hwp" or "hwpx"
    formData.append("password", "");
    formData.append("apiKey", apiKey);
    
    // Step 4: Send the conversion request
    const response = await fetch(HANCOM_API_URL, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hancom API Error:", errorText);
      
      // Fall back to docx if conversion fails
      saveAs(blob, `${filename}.docx`);
      
      return { 
        success: false, 
        error: `변환 실패 (${response.status}). DOCX 형식으로 저장됩니다.` 
      };
    }
    
    // Step 5: Download the converted file
    const convertedBlob = await response.blob();
    saveAs(convertedBlob, `${filename}.${format}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error converting document:", error);
    
    // Get the original document as blob and save as docx
    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${filename}.docx`);
    } catch (fallbackError) {
      console.error("Error saving as DOCX:", fallbackError);
    }
    
    return { 
      success: false, 
      error: "문서 변환 중 오류가 발생했습니다. DOCX 형식으로 저장됩니다." 
    };
  }
};
