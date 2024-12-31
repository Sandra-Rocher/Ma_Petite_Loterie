

import { jsPDF } from "jspdf";  // Import jsPDF

// Generate PDF with the draw results (and, if button clicked, location results)
function generatePDF(): void {
    // Get geolocalisation
    navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
            const lat: number = position.coords.latitude;
            const lon: number = position.coords.longitude;

            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
                .then((response: Response) => response.json())
                .then((data: any) => {
                    // Extracting the location data from the response
                    const road: string = data.address.road || "Rue non trouvée";
                    const city: string = data.address.city || data.address.town || data.address.village || "Non trouvée";
                    const country: string = data.address.country || "Pays non trouvé";
                    const postcode: string = data.address.postcode || "Code postal non trouvé";
                    const county: string = data.address.county || "Non trouvée";
                    const state: string = data.address.state || "Non trouvée";

                    // Get date and time
                    const today: Date = new Date();
                    const date: string = today.toLocaleDateString();
                    const time: string = today.toLocaleTimeString();

                    // Get winners data
                    const maxParticipants: string = (document.getElementById("maxParticipants") as HTMLInputElement).value || "Inconnu";
                    const numWinners: string = (document.getElementById("numWinners") as HTMLInputElement).value || "Inconnu";
                    const winnersList: HTMLElement | null = document.getElementById("winnersList");
                    const winners: string[] = winnersList ? Array.from(winnersList.querySelectorAll("li")).map((li: HTMLLIElement) => li.textContent || "") : [];

                    // Create PDF
                    const pdf = new jsPDF();

                    // Find the total width and the height of the page
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    // Margin of the page and start a Y position for every line of text 
                    const margin = 10;
                    let yPosition = 10;

                    // Add annotation in the top right corner for location details
                    const locationDetails = `
                    Pays: ${country}
                    Ville: ${city}
                    Code postal: ${postcode}
                    Rue: ${road}
                    `.trim();

                    // Position for the annotation (top-right corner)
                    const annotationWidth = 10;
                    const annotationX = pageWidth - annotationWidth - 5;
                    const annotationY = 5;

                    // Add annotation for location details
                    pdf.createAnnotation({
                    type: "text",
                    title: "Informations de localisation",
                    bounds: {
                        x: annotationX,
                        y: annotationY,
                        w: annotationWidth,
                        h: 40
                    },
                    contents: locationDetails,
                    open: false
                    });

                    // Header and Title
                    pdf.setFontSize(16);
                    pdf.text("Preuve du tirage au sort - Ma Petite Loterie", 50, yPosition);
                    yPosition += 10;

                    // Line black + bold size 1
                    pdf.setLineWidth(1);
                    pdf.setDrawColor(0, 0, 0);
                    pdf.line(10, yPosition, pageWidth - 10, yPosition);
                    yPosition += 10;

                    pdf.setFontSize(13);
                    pdf.text("Conditions :", 10, yPosition);
                    yPosition += 10;

                    // Lottery details
                    pdf.setFontSize(10);
                    pdf.text(`Nombre de participant maximum saisis : ${maxParticipants}`, 10, yPosition);
                    yPosition += 10;
                    pdf.text(`Nombre de gagnant maximum saisis : ${numWinners}`, 10, yPosition);
                    yPosition += 10;

                    // New line
                    pdf.line(10, yPosition, pageWidth - 10, yPosition);
                    yPosition += 10;

                    // Draw results
                    pdf.setFontSize(13);
                    pdf.text("Résultat du tirage au sort de la loterie :", 10, yPosition);
                    yPosition += 10;

                    // List of winners : if too many, add a new page
                    pdf.setFontSize(10);
                    winners.forEach((winner, index) => {
                        if (yPosition > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.text(`${index + 1}. ${winner}`, 10, yPosition);
                        yPosition += 10;
                    });


                    // If too many, add a new page
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                
                    // New line 
                    pdf.setLineWidth(1);
                    pdf.line(10, yPosition, pageWidth - 10, yPosition);
                    yPosition += 10;

                    // Date + Time color grey + center
                    pdf.setFontSize(10);
                    pdf.setTextColor(105, 105, 105);
                    const dateText = `Date : ${date} et Heure : ${time}`;
                    const textWidth = pdf.getTextWidth(dateText);
                    const xPosition = (pageWidth - textWidth) / 2;
                    pdf.text(dateText, xPosition, yPosition);
                    yPosition += 10;

                    // // Location informations
                    // pdf.setFontSize(16);
                    // pdf.text("Informations de localisation :", 10, yPosition);
                    // yPosition += 10;

                    // // Location details : if too many, add a new page
                    // pdf.setFontSize(10);
                    // if (yPosition > pageHeight - margin) {
                    //     pdf.addPage();
                    //     yPosition = margin;
                    // }
                    // pdf.text(`Pays : ${country}`, 10, yPosition);
                    // yPosition += 10;
                    // pdf.text(`Ville : ${city}`, 10, yPosition);
                    // yPosition += 10;
                    // pdf.text(`Code postal : ${postcode}`, 10, yPosition);
                    // yPosition += 10;
                    // pdf.text(`Rue : ${road}`, 10, yPosition);
                    // yPosition += 10;


                    // Download PDF
                    pdf.save(`Resultat_Loterie_${date}_${time}.pdf`);

                })
                .catch((error: Error) => {
                    console.error("Erreur lors de la récupération des données de géolocalisation :", error);
                });
        },
        (error: GeolocationPositionError) => {
            console.error("Erreur de géolocalisation :", error);
        }
    );
}
