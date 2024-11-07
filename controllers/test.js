const generateUniqueId = () => {
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomNum = Math.floor(Math.random() * 100); // Random number between 0-99
  const uniqueId = (timestamp + randomNum) % 1000000; // Ensure it's a 6-digit number using modulo
  return parseInt(uniqueId.toString().padStart(6, '0')); // Pad with leading zeros if needed
};
console.log(generateUniqueId());