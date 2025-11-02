"use client"

import Image from "next/image"
import { useRef, useState, useEffect, useMemo } from "react"
import MobileDashboardLayout from "@/components/mobile-dashboard-layout"
import {QRCodeSVG} from 'qrcode.react';
import { createClient } from "@/lib/client"

const DEFAULT_AVATAR_URL = "https://github.com/shadcn.png"

interface Student {
  id: string
  full_name: string
  rollNo: string,
  student_id: string,
  email: string
  avatar: string
  admit_date?: string | null // Date in YYYY-MM-DD format
}

function getFullDateString() {
  const now = new Date()
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

// Format admit date as "Saturday, November 1, 2025"
function formatAdmitDate(dateString: string | null | undefined): string {
  if (!dateString) return ""
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  } catch {
    return ""
  }
}

// Helper to generate QR code IMG as string (for print/pdf)
function generateQRCodeIMGString(qrImageUrl: string, size = 120) {
  return `<img src="${qrImageUrl}" alt="QR Code" style="border:1px solid #cbd5e1;border-radius:8px;width:${size}px;height:${size}px;object-fit:contain;" />`
}

export default function PrintStudentCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL)
  const [loading, setLoading] = useState(true)
  const [admitDate, setAdmitDate] = useState<string>("")

  useEffect(() => {
    // Admit date will be set after fetching student data
    const supabase = createClient()
    const fetchStudent = async () => {
      setLoading(true)
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setStudent(null)
        setAvatarUrl(DEFAULT_AVATAR_URL)
        setLoading(false)
        return
      }
      // Fetch student row for this user
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        setStudent(null)
        setAvatarUrl(DEFAULT_AVATAR_URL)
      } else {
        setStudent(data as Student)
        
        // Format and set admit date (static from table - admin only)
        if (data.admit_date) {
          setAdmitDate(formatAdmitDate(data.admit_date))
        } else {
          setAdmitDate("") // No admit date set yet
        }
        
        // If avatar path exists, get public URL from avatars bucket
        if (data.avatar) {
          const { data: publicUrlData } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(data.avatar)
          if (!publicUrlData?.publicUrl) {
            setAvatarUrl(DEFAULT_AVATAR_URL)
          } else {
            setAvatarUrl(publicUrlData.publicUrl)
          }
        } else {
          setAvatarUrl(DEFAULT_AVATAR_URL)
        }
      }
      setLoading(false)
    }

    fetchStudent()
  }, [])

  const getStudentQRData = () => {
    if (!student) return ""
    return `Name: ${student.full_name}
ID: ${student.student_id}
Roll No: ${student.rollNo}
Email: ${student.email}`
  }

  // Memoize the QR image URL so it doesn't change between renders
  const qrImageUrl = useMemo(() => {
    const data = getStudentQRData()
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=120x120&color=1e293b&bgcolor=ffffff`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student])

  // These helpers are used for fallback print rendering
  const getFrontSideData = () => {
    if (!student) return ""
    return `Name: ${student.full_name}
Roll No: ${student.rollNo}
Admit Date: ${admitDate || "Not Set"}`
  }

  const getBackSideData = () => {
    if (!student) return ""
    return `Student ID: ${student.rollNo}
Email: ${student.email}`
  }

  // PDF export
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return

    // Dynamically import html2canvas and jsPDF to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default
    const jsPDF = (await import("jspdf")).jsPDF

    // Find the front and back side elements
    const card = cardRef.current
    const frontSide = card.querySelector('[data-side="front"]')
    const backSide = card.querySelector('[data-side="back"]')

    // Helper to render a side to canvas and return dataURL
    const renderSideToImage = async (sideElem: HTMLElement) => {
      // Add border and radius for PDF
      const originalStyle = sideElem.getAttribute("style") || ""
      sideElem.style.borderRadius = "24px"
      sideElem.style.border = "4px solid #2563eb"
      sideElem.style.overflow = "hidden"
      // If this is the back side, temporarily add QR code for PDF
      let qrContainer: HTMLDivElement | null = null
      if (sideElem.getAttribute("data-side") === "back") {
        // Remove any existing QR code (avoid duplicates)
        const existingQR = sideElem.querySelector(".pdf-qr-code")
        if (existingQR) existingQR.remove()
        qrContainer = document.createElement("div")
        qrContainer.className = "pdf-qr-code"
        qrContainer.style.display = "flex"
        qrContainer.style.justifyContent = "center"
        qrContainer.style.alignItems = "center"
        qrContainer.style.marginTop = "16px"
        qrContainer.style.marginBottom = "16px"
        // Use a static QR code image for PDF
        const qrImg = document.createElement("img")
        qrImg.src = qrImageUrl
        qrImg.alt = "QR Code"
        qrImg.style.border = "1px solid #cbd5e1"
        qrImg.style.borderRadius = "8px"
        qrImg.style.width = "120px"
        qrImg.style.height = "120px"
        qrImg.style.objectFit = "contain"
        qrContainer.appendChild(qrImg)
        const qrLabel = document.createElement("p")
        qrLabel.textContent = "Scan for student information"
        qrLabel.style.fontSize = "0.8rem"
        qrLabel.style.color = "#64748b"
        qrLabel.style.textAlign = "center"
        qrLabel.style.marginTop = "4px"
        qrContainer.appendChild(qrLabel)
        sideElem.appendChild(qrContainer)
        // 🧾 Wait for QR image to load before html2canvas
        if (qrImg && !qrImg.complete) {
          await new Promise((resolve) => {
            qrImg.onload = resolve
            qrImg.onerror = resolve
          })
        }
      }
      // Render to canvas
      const canvas = await html2canvas(sideElem as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      })
      // Restore style and remove QR if added
      sideElem.setAttribute("style", originalStyle)
      if (qrContainer) {
        sideElem.removeChild(qrContainer)
      }
      return {
        imgData: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height
      }
    }

    // If both sides exist, render both as separate pages
    if (frontSide && backSide) {
      // Render front
      const frontResult = await renderSideToImage(frontSide as HTMLElement)
      // Render back
      const backResult = await renderSideToImage(backSide as HTMLElement)

      // Create PDF with two pages, using 'letter' size
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "letter",
      })

      // Calculate image size to fit within letter page (792pt x 612pt in landscape)
      const pageWidth = 792
      const pageHeight = 612

      // Helper to fit image within page, preserving aspect ratio
      function getFitDimensions(imgWidth: number, imgHeight: number, maxWidth: number, maxHeight: number) {
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
        return {
          width: imgWidth * ratio,
          height: imgHeight * ratio,
          x: (maxWidth - imgWidth * ratio) / 2,
          y: (maxHeight - imgHeight * ratio) / 2,
        }
      }

      // Add front side
      const frontDims = getFitDimensions(frontResult.width, frontResult.height, pageWidth, pageHeight)
      pdf.addImage(frontResult.imgData, "PNG", frontDims.x, frontDims.y, frontDims.width, frontDims.height)

      // Add new page for back side
      pdf.addPage("letter", "landscape")
      const backDims = getFitDimensions(backResult.width, backResult.height, pageWidth, pageHeight)
      pdf.addImage(backResult.imgData, "PNG", backDims.x, backDims.y, backDims.width, backDims.height)

      pdf.save("student-Card by QuickTech.pdf")
    } else {
      // Fallback: render the whole card as one page (legacy behavior)
      // Find the back side element to render QR code on it
      const backSide = card.querySelector('[data-side="back"]')

      // Temporarily add a QR code to the back side for PDF export
      let qrContainer: HTMLDivElement | null = null
      if (backSide) {
        // Remove any existing QR code (avoid duplicates)
        const existingQR = backSide.querySelector(".pdf-qr-code")
        if (existingQR) existingQR.remove()
        qrContainer = document.createElement("div")
        qrContainer.className = "pdf-qr-code"
        qrContainer.style.display = "flex"
        qrContainer.style.justifyContent = "center"
        qrContainer.style.alignItems = "center"
        qrContainer.style.marginTop = "16px"
        qrContainer.style.marginBottom = "16px"
        const qrImg = document.createElement("img")
        qrImg.src = qrImageUrl
        qrImg.alt = "QR Code"
        qrImg.style.border = "1px solid #cbd5e1"
        qrImg.style.borderRadius = "8px"
        qrImg.style.width = "120px"
        qrImg.style.height = "120px"
        qrImg.style.objectFit = "contain"
        qrContainer.appendChild(qrImg)
        const qrLabel = document.createElement("p")
        qrLabel.textContent = "Scan for student information"
        qrLabel.style.fontSize = "0.8rem"
        qrLabel.style.color = "#64748b"
        qrLabel.style.textAlign = "center"
        qrLabel.style.marginTop = "4px"
        qrContainer.appendChild(qrLabel)
        backSide.appendChild(qrContainer)
        // 🧾 Wait for QR image to load before html2canvas
        if (qrImg && !qrImg.complete) {
          await new Promise((resolve) => {
            qrImg.onload = resolve
            qrImg.onerror = resolve
          })
        }
      }

      // Use html2canvas to render the card as an image, with rounded corners and border
      const originalStyle = card.getAttribute("style") || ""
      card.style.borderRadius = "24px"
      card.style.border = "4px solid #2563eb" // blue-700
      card.style.overflow = "hidden"

      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      })
      const imgData = canvas.toDataURL("image/png")

      // Restore original style
      card.setAttribute("style", originalStyle)
      // Remove the temporary QR code from the back side
      if (backSide && qrContainer) {
        backSide.removeChild(qrContainer)
      }

      // Create PDF using 'letter' size
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "letter",
      })

      // Fit image within letter page (792pt x 612pt in landscape)
      const pageWidth = 792
      const pageHeight = 612
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
      const imgWidth = canvas.width * ratio
      const imgHeight = canvas.height * ratio
      const x = (pageWidth - imgWidth) / 2
      const y = (pageHeight - imgHeight) / 2

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)
      pdf.save("student-Card by QuickTech.pdf")
    }
  }

  // Print both Front Side and Back Side of the card, as two separate bordered cards
  const handlePrint = () => {
    if (!cardRef.current) return

    // Find the front and back side elements inside the cardRef
    const cardNode = cardRef.current
    const frontSide = cardNode.querySelector('[data-side="front"]')
    const backSide = cardNode.querySelector('[data-side="back"]')

    // If not found, fallback to printing the custom front and back data
    let printContents = ""
    const cardPrintStyle = 'display:flex;flex-direction:column;align-items:center;justify-content:space-between;height:100%;min-height:600px;width:700px;max-width:100%;padding:32px 24px;box-sizing:border-box;'

    if (frontSide && backSide) {
      // Custom backside design for print
      // We'll reconstruct the back side HTML for print with a more visually rich layout
      // (You can further style as needed)
      const studentData = student || {}
      // For the front side, we want to replace Student ID with Full Date
      // So we clone the frontSide and replace the Student ID element with the date
      let frontSideHtml = frontSide.outerHTML
      // We'll do a simple string replace: find the <p> with student.rollNo and replace with date
      // But since the rollNo is used as the last <p> in the front, we can replace it
      // Note: We're keeping the front side HTML as is - admit date is already in the card display
      // For the QR code, use a static QR code image for print
      const qrCodeImg = generateQRCodeIMGString(qrImageUrl, 120)
      // Add blue-700 color to student name and STUDENT ID CARD in print HTML
      frontSideHtml = frontSideHtml.replace(
        /(<h2[^>]*)(>)(\s*STUDENT ID CARD\s*)(<\/h2>)/,
        '$1 style="color:#1d4ed8;"$2$3$4'
      )
      frontSideHtml = frontSideHtml.replace(
        /(<h3[^>]*)(>)([\s\S]*?)(<\/h3>)/,
        '$1 style="color:#1d4ed8;"$2$3$4'
      )
      printContents = `
        <div class="separate-card" style="${cardPrintStyle}margin-bottom:48px;">
          ${frontSideHtml}
        </div>
        <div class="separate-card" style="${cardPrintStyle}">
          <div style="width:100%;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-weight:600;color:#334155;">Student ID:</span>
              <span style="color:#475569;">${student?.rollNo || ""}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-weight:600;color:#334155;">Registration#</span>
              <span style="color:#475569;">${student?.student_id || ""}</span>
            </div>
          </div>
          <div style="margin:8px; display: flex; flex-direction: column; align-items: center;">
            <div style="width:200px;height:2px;background:#cbd5e1;margin:0 auto 0 auto;display:flex;justify-content:center;"></div>
            <p style="text-align:center;font-size:1rem;font-weight:600;color:#2563eb;">Authorized Signature</p>
          </div>
          <div style="margin-bottom:16px;">
            <p style="font-weight:600;color:#334155;font-size:0.95rem;margin-bottom:2px;">Note:</p>
            <p style="color:#64748b;font-size:0.95rem;margin-bottom:2px;">Finder of this card may please post it to</p>
            <p style="font-weight:600;color:#334155;font-size:0.95rem;">Quick Tech Institute of I.T MPM</p>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:16px;">
            ${qrCodeImg}
            <p style="font-size:0.8rem;color:#64748b;text-align:center;margin-top:4px;">Scan for student information</p>
          </div>
          <div style="width:100%;margin-top:auto;">
            <div style="display:flex;align-items:center;font-size:0.95rem;margin-bottom:2px;">
              <span style="font-weight:600;color:#334155;margin-right:6px;">Contact:</span>
              <span style="color:#2563eb;">+92 21 1234 5678</span>
            </div>
            <div style="display:flex;align-items:center;font-size:0.95rem;margin-bottom:2px;">
              <span style="font-weight:600;color:#334155;margin-right:6px;">Email:</span>
              <a href="mailto:education@quicktech.com" style="color:#2563eb;text-decoration:underline;font-size:0.85rem;">
             education@quicktech.com
              </a>
            </div>
            <div style="display:flex;align-items:center;font-size:0.95rem;">
              <span style="font-weight:600;color:#334155;margin-right:6px;">URL:</span>
              <a href="www.quicktech.com/" style="color:#2563eb;text-decoration:underline;font-size:0.85rem;">
              www.quicktech.com/
              </a>
            </div>
          </div>
        </div>
      `
    } else {
      // If not found, print the custom front and back data
      const studentData = student || {}
      const qrCodeImg = generateQRCodeIMGString(qrImageUrl, 120)
      printContents = `
        <div class="separate-card" style="${cardPrintStyle}margin-bottom:48px;">
          <pre style="text-align:left;font-size:1.1rem;">${getFrontSideData()}</pre>
          <div style="margin-top:16px;">
            <img src="/Quick%20Tech.png" alt="QuickTech Logo" style="width:96px;height:96px;object-fit:contain;" />
          </div>
        </div>
        <div class="separate-card" style="${cardPrintStyle}">
          <div style="width:100%;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-weight:600;color:#334155;">Student ID:</span>
              <span style="color:#475569;">${student?.rollNo|| ""}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-weight:600;color:#334155;">Registration#</span>
              <span style="color:#475569;">${student?.student_id || ""}</span>
            </div>
          </div>
          <div style="margin-bottom:8px; display: flex; flex-direction: column; align-items: center;">
            <div style="width:300%;height:2px;background:#cbd5e1;margin:0 auto 4px auto;display:flex;justify-content:center;"></div>
            <p style="text-align:center;font-size:1rem;font-weight:600;color:#2563eb;">Authorized Signature</p>
          </div>
          <div style="margin-bottom:16px;">
            <p style="font-weight:600;color:#334155;font-size:0.95rem;margin-bottom:2px;">Note:</p>
            <p style="color:#64748b;font-size:0.95rem;margin-bottom:2px;">Finder of this card may please post it to</p>
            <p style="font-weight:600;color:#334155;font-size:0.95rem;">Quick Tech Institute of I.T MPM</p>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:16px;">
            ${qrCodeImg}
            <p style="font-size:0.8rem;color:#64748b;text-align:center;margin-top:4px;">Scan for student information</p>
          </div>
          <div style="width:100%;margin-top:auto;">
            <div style="display:flex;align-items:center;font-size:0.95rem;margin-bottom:2px;">
              <span style="font-weight:600;color:#334155;margin-right:6px;">Contact:</span>
              <span style="color:#2563eb;">+92 21 1234 5678</span>
            </div>
            <div style="display:flex;align-items:center;font-size:0.95rem;margin-bottom:2px;">
              <span style="font-weight:600;color:#334155;margin-right:6px;">Email:</span>
              <a href="mailto:education@quicktech.com" style="color:#2563eb;text-decoration:underline;font-size:0.85rem;">
               education@quicktech.com
              </a>
            </div>
            <div style="display:flex;align-items:center;font-size:0.95rem;">
              <span style="font-weight:600;color:#334155;margin-right:6px;">URL:</span>
              <a href="www.quicktech.com/" style="color:#2563eb;text-decoration:underline;font-size:0.85rem;">
             www.quicktech.com/
              </a>
            </div>
          </div>
        </div>
      `
    }

    // Increase the print window width from 900 to 1200
    const printWindow = window.open("", "_blank", "width=1200,height=800")
    if (!printWindow) return

    const style = `
      <style>
        @media print {
          body { background: white !important; margin: 4 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-student-card {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 48px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .separate-card {
            border-radius: 24px !important;
            border: 4px solid #2563eb !important;
            background: #fff !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            width: 700px !important;
            min-height: 600px !important;
            max-width: 100% !important;
            margin: 0 24px 0 0 !important;
            box-sizing: border-box !important;
            box-shadow: 0 4px 24px 0 rgba(37,99,235,0.08) !important;
            padding: 32px 24px !important;
          }
          .separate-card:last-child {
            margin-right: 0 !important;
          }
          .separate-card * {
            text-align: center !important;
          }
          .side-label {
            font-weight: bold;
            font-size: 1.25rem;
            margin-bottom: 8px;
            text-align: center;
            color: #2563eb;
          }
        }
        body { background: #f1f5f9; margin: 0; padding: 0; }
        .print-student-card {
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          justify-content: center !important;
          gap: 48px !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .separate-card {
          border-radius: 20px !important;
          border: 3px solid #2563eb !important;
          background: #fff !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          width: 700px !important;
          min-height: 600px !important;
          max-width: 90vw !important;
          margin: 0 24px 0 0 !important;
          box-sizing: border-box !important;
          box-shadow: 0 4px 24px 0 rgba(37,99,235,0.08) !important;
          padding: 32px 24px !important;
        }
        .separate-card:last-child {
          margin-right: 0 !important;
        }
        .separate-card * {
          text-align: center !important;
        }
        .side-label {
          font-weight: bold;
          font-size: 1.25rem;
          margin-bottom: 8px;
          text-align: center;
          color: #2563eb;
        }
        pre {
          background: none !important;
          border: none !important;
          font-family: inherit !important;
          white-space: pre-line !important;
        }
      </style>
    `

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Student Card</title>
          ${style}
        </head>
        <body>
          <div style="display:flex;justify-content:center;align-items:flex-start;min-height:100vh;">
            <div class="print-student-card">
              ${printContents}
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()

    // 🖨️ Wait for all <img> in the new window to load before printing
    const imgs = printWindow.document.images
    let loaded = 0
    if (imgs.length === 0) {
      printWindow.print()
      printWindow.close()
    } else {
      for (let img of imgs) {
        img.onload = img.onerror = () => {
          loaded++
          if (loaded === imgs.length) {
            printWindow.focus()
            printWindow.print()
            printWindow.close()
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <MobileDashboardLayout>
        <div className="flex justify-center items-center h-96 text-gray-600">
          Loading student card...
        </div>
      </MobileDashboardLayout>
    )
  }

  if (!student) {
    return (
      <MobileDashboardLayout>
        <div className="flex justify-center items-center h-96 text-red-600">
          No student found.
        </div>
      </MobileDashboardLayout>
    )
  }

  return (
    <MobileDashboardLayout>
      <div className="flex flex-col items-center gap-8 p-4 sm:p-6">
        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 no-print"
        >
          Print
        </button>

        <div
          ref={cardRef}
          className="flex flex-col xl:flex-row gap-12 items-center justify-center bg-white p-4 sm:p-8 rounded-lg w-full max-w-full"
        >
          {/* Front Side */}
          <div
            className="w-full max-w-xs sm:w-96 h-[500px] sm:h-[600px] bg-white rounded-2xl border-2 border-gray-300 shadow-lg p-4 sm:p-8 flex flex-col items-center"
            data-side="front"
          >
            <div className="flex items-center justify-center mb-6 bg-white">
              <Image
                src="/Quick Tech.png"
                alt="QuickTech Logo"
                width={128}
                height={128}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-1"
                priority
              />
            </div>

            <h2 className="text-lg sm:text-2xl font-bold mb-6 tracking-wide text-center text-blue-700">
              STUDENT ID CARD
            </h2>

            <div className="w-28 h-32 sm:w-40 sm:h-48 border-2 border-black mb-6 overflow-hidden">
              <Image
                src={avatarUrl || "/default-photo.png"}
                alt="Student Photo"
                width={160}
                height={192}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            <h3 className="text-lg sm:text-2xl font-bold mb-4 text-center text-blue-700">
              {student.full_name}
            </h3>
            {admitDate && (
              <p className="text-base sm:text-lg font-semibold text-gray-700 text-center">
                Admit Date: {admitDate}
              </p>
            )}
          </div>

          {/* Back Side */}
          <div
            className="w-full max-w-xs sm:w-96 h-[500px] sm:h-[600px] bg-white rounded-2xl border-2 border-gray-300 shadow-lg p-4 sm:p-8 flex flex-col"
            data-side="back"
          >
            <div className="mb-2">
              <div className="flex justify-between sm:mb-2">
                <span className="font-semibold text-gray-700">Student ID:</span>
                <span className="text-gray-600">{student.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Registration#</span>
                <span className="text-gray-600">{student.rollNo}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <div className="h-6 sm:h-8 border-b border-gray-300 mb-1 flex items-end justify-center"></div>
              <p className="text-center text-sm font-semibold text-gray-700">Authorized Signature</p>
            </div>

            <div className="mb-4 mt-4">
              <p className="font-semibold text-gray-700 text-sm">Note:</p>
              <p className="text-sm text-gray-600">Finder of this card may please post it to</p>
              <p className="text-sm font-semibold text-gray-700">Quick Tech Institute of I.T MPM</p>
            </div>

            <div className="flex flex-col items-center mb-6">
              {/* For screen, use QRCodeSVG; for print/pdf, use static QR code image */}
              <div className="screen-only">
                <QRCodeSVG
                  value={getStudentQRData()}
                  size={120}
                  bgColor="#ffffff"
                  fgColor="#1e293b"
                  level="Q"
                  className="border border-gray-300 rounded"
                />
              </div>
              <img
                src={qrImageUrl}
                alt="QR Code"
                className="print-only pdf-only border border-gray-300 rounded"
                width={120}
                height={120}
                style={{ display: "none" }}
              />
              <p className="text-xs text-gray-600 text-center">Scan for student information</p>
            </div>

            <div className="space-y-1 mt-auto">
              <div className="flex items-center text-sm">
                <span className="font-semibold text-gray-700 mr-2">Contact:</span>
                <span className="text-blue-600">+92 21 1234 5678</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-semibold text-gray-700 mr-2">Email:</span>
                <a href={`mailto:education@quicktech.com`} className="text-blue-600 underline text-xs">
                education@quicktech.com
                </a>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-semibold text-gray-700 mr-2">URL:</span>
                <a href="www.quicktech.com" className="text-blue-600 underline text-xs">
                www.quicktech.com/
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Print/Screen/PDF QR code CSS */}
        <style jsx global>{`
          @media print {
            .screen-only { display: none !important; }
            .print-only { display: block !important; }
          }
          .print-only, .pdf-only { display: none; }
        `}</style>
      </div>
    </MobileDashboardLayout>
  )
}
