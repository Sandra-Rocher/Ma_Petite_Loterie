

//Generate PDF with the draw results (and, if button clicked, location results)
function generatePDF() {
    const { jsPDF } = window.jspdf;

    // Get geolocalisation
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
                .then((response) => response.json())
                .then((data) => {
                    const road = data.address.road || "Rue non trouvée";
                    const city = data.address.city || data.address.town || data.address.village || "Non trouvée";
                    const country = data.address.country || "Pays non trouvé";
                    const postcode = data.address.postcode || "Code postal non trouvé";
                    const county = data.address.county || "Non trouvée";
                    const state = data.address.state || "Non trouvée";

                    // Get date time
                    const today = new Date();
                    const date = today.toLocaleDateString();
                    const time = today.toLocaleTimeString();

                    // Get winners datas
                    const maxParticipants = document.getElementById("maxParticipants").value || "Inconnu";
                    const numWinners = document.getElementById("numWinners").value || "Inconnu";
                    const winnersList = document.getElementById("winnersList");
                    const winners = Array.from(winnersList.querySelectorAll("li")).map((li) => li.textContent);

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
                .catch((error) => {
                    console.error("Erreur lors de la récupération des données de géolocalisation :", error);
                });
        },
        function (error) {
            console.error("Erreur de géolocalisation :", error);
        }
    );
}
