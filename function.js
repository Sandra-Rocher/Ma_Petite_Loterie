
function createSaveFiles(
    
    city: string,            
    country: string,         
    date: string,          
    time: string,           
    numWinners: number,     
    maxParticipants: number, 
    winners: number[]       
 ) {


    const filename = generateFilename(city, country, date, time, numWinners, maxParticipants);
    const xmlContent = generateXMLContent(city, country, date, time, numWinners, maxParticipants, winners);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

}