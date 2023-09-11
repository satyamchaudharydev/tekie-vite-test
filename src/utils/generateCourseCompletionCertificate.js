import { getCourseName } from './getCourseId'
import { PDFDocument, rgb } from 'pdf-lib'
import { List } from 'immutable'
import { format } from 'date-fns'
import { filterKey } from "./data-utils";
import fontkit from '@pdf-lib/fontkit'
import { COURSE_CERTIFICATE_URL, NUNITO_REGULAR_FONT_URL, NUNITO_BOLD_FONT_URL } from '../config';

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase()
  );

export const getCourseTitle = () => {
  let courseName = getCourseName()
  if (courseName) {
    courseName = capitalize(courseName)
    return courseName
  }
  return null
}

const dataURItoBlob = (dataURI) => {
  const byteString = window.atob(dataURI);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
  int8Array[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([int8Array], { type: 'application/pdf'});
  return blob;
}
const masteryLevelCoordinates = {
  MASTER: {
    x: 812,
    y: 341,
  },
  PROFICIENT: {
    x: 800,
    y: 341,
  },
  FAMILIAR: {
    x: 808,
    y: 341,
  },
}
const generateCourseCompletionCertificate = async (downloadBtnID, lastSessionDate = null, proficiencyLevel) => {
  const courseName = getCourseTitle()
  const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List({})
  if (!user || !user.getIn([0, 'parent', 'parentProfile', 'children'])) {
      return ''
  }
  const userName = user.getIn([0, 'name'])
  const sessionDate = lastSessionDate ? format(new Date(lastSessionDate), 'MMM dd, yyyy') : null
  
  const masteryLevel = proficiencyLevel
  if (courseName && userName && sessionDate && masteryLevel) {
    try {
      const existingPdfBytes = await fetch(COURSE_CERTIFICATE_URL).then((res) => {
          return res.arrayBuffer()
      });
      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
      
      //get font
      const NunitorRegularfontBytes = await fetch(NUNITO_REGULAR_FONT_URL).then((res) =>
          res.arrayBuffer()
      );
      const NunitorBoldfontBytes = await fetch(NUNITO_BOLD_FONT_URL).then((res) =>
          res.arrayBuffer()
      );
    
      // Embed our custom font in the document
      const NunitoRegularFont = await pdfDoc.embedFont(NunitorRegularfontBytes);
      const NunitoBoldFont = await pdfDoc.embedFont(NunitorBoldfontBytes);
    
      // Get the first page of the document
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      // Draw a string of text diagonally across the first page
      await firstPage.drawText(capitalize(userName), {
          x: 296,
          y: 579,
          size: 26,
          font: NunitoRegularFont,
          color: rgb(0.30,0.30,0.30),
      });
      await firstPage.drawText(courseName, {
          x: 97,
          y: 518,
          size: 26,
          font: NunitoBoldFont,
          color: rgb(0.24, 0.751, 0.900),
      });
      await firstPage.drawText(sessionDate, {
          x: 306,
          y: 489,
          size: 21,
          font: NunitoBoldFont,
          color: rgb(0.30,0.30,0.30),
      });
      await firstPage.drawText(masteryLevel, {
          ...masteryLevelCoordinates[masteryLevel],
          size: 15,
          font: NunitoBoldFont,
          color: rgb(1,1,1),
      });
    
      /** PDF Meta Details */
      pdfDoc.setAuthor('Tekie')
      pdfDoc.setCreator('Kiwhode Learning Pvt Ltd')
      pdfDoc.setSubject('Course Completion Certificate')
      pdfDoc.setTitle(courseName)
      pdfDoc.setProducer('Tekie.in')
      /**
       * Serialize the PDFDocument to bytes (a Uint8Array)
       * const pdfBytes = await pdfDoc.save(); 
       * */ 
      const pdfBase64 = await pdfDoc.saveAsBase64();
      
      const blob = dataURItoBlob(pdfBase64);
      const url = URL.createObjectURL(blob);
      let certificateDownloadBtn = null
      if (downloadBtnID) {
        certificateDownloadBtn = document.getElementById(downloadBtnID)
      } else {
        certificateDownloadBtn = document.getElementById('courseCompletionCertificateDownloadBtn')
      }
      if (certificateDownloadBtn) {
        certificateDownloadBtn.href = url
        certificateDownloadBtn.download = `${courseName}_proof_of_completion.pdf`
      }
      // to open the PDF in a new window
      // window.open(url, '_blank');
      return url
    } catch (e) {
    }
  }
  return null
};

export default generateCourseCompletionCertificate