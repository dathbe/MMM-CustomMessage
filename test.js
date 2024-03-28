const message = {
  messageHeader: 'Thats a Test Message Header!',
  message: 'And That is a Test Text 😀'
};

const postMessage = async () => {
  try {
    const response = await fetch('http://localhost:8080/custom-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

postMessage();