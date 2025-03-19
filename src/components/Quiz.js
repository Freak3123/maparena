import React, { useState, useEffect, useRef } from "react";
import { Badge } from "./ui/badge";
import axios from "axios";
import { QuestionCard, OptionCard } from "@/components/ui/card";
import confetti from "canvas-confetti";
import Fact from "./Fact";
import ScoreCard from "./ScoreCard";
import Hero from '@/components/Hero';
import domtoimage from "dom-to-image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const Quiz = () => {
    const [randomDestination, setRandomDestination] = useState({});
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState("");
    const [correct, setCorrect] = useState(null);
    const [options, setOptions] = useState([]);
    const [showNextClue, setShowNextClue] = useState(false);
    const cardRef = useRef(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);
    const captureRef = useRef(null);

    useEffect(() => {
        getRandomDestination();
    }, []);

    const getRandomDestination = async () => {
        try {
            const response = await axios.get("/api/random-dest");
            setRandomDestination(response.data);
            setShowNextClue(false);
            setOptions([...response.data.options].sort(() => Math.random() - 0.5));
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const checkAnswer = (option) => {
        if (selected) return; // Prevent multiple clicks

        setSelected(option);
        setTotalAnswers(totalAnswers + 1);

        if (option === randomDestination.correctDestination.city) {
            setCorrect(true);
            setScore(score + 10);
            setCorrectAnswers(correctAnswers + 1);

            // Confetti effect only for correct answers
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"],
            });
        } else {
            setCorrect(false);
            setWrongAnswers(wrongAnswers + 1);
        }

        setAccuracy(((correctAnswers / (totalAnswers + 1)) * 100).toFixed(2));
    };

    const updateHighScore = async () => {
        try {
            const response = await axios.get(`/api/highscore?email=${session.user.email}`);
            const highScore = response.data.highscore;
            console.log(score, highScore);
            if (score > highScore) {
                console.log(score, highScore);
                await axios.post('/api/highscore', { email: session.user.email, highscore: score });
                console.log('New high score updated!');
            } else {
                console.log('Score did not beat the high score.');
            }
        } catch (error) {
            console.error('Error fetching or updating high score:', error);
        }
    };

    const nextQuestion = () => {
        setCorrect(false);
        setSelected("");
        getRandomDestination();
    };

    const generateImageAndShare = async (cardRef) => {
        if (!cardRef.current) return;
    
        try {
            // Convert the div to an image
            const dataUrl = await domtoimage.toPng(cardRef.current);
            setImageUrl(dataUrl);
    
            // Convert dataURL to Blob
            const blob = await fetch(dataUrl).then((res) => res.blob());
    
            // Create FormData to send to Cloudinary
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    
            // Upload to Cloudinary
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Access-Control-Allow-Origin": "*",  // Allow all origins (for testing)
                    },
                }
            );
    
            console.log("Image uploaded successfully:", response.data.secure_url);
            setImageUrl(response.data.secure_url); // Ensure it's updated for WhatsApp sharing
            return response.data.secure_url;
    
        } catch (error) {
            console.error("Image generation or upload failed:", error);
        }
    };    
    
    const shareImage = () => {
        const customLink = `https://maparena.com/challenge?score=${score}`;
        const message = `🌍 I just played Maparena!\n💯 Score: ${score}\n \nCan you beat my score? Check it out here: ${customLink}`;
    
        if (navigator.share) {
            navigator.share({
                title: "Maparena Challenge",
                text: message,
                url: imageUrl, // Some devices support images
            }).catch(error => console.error("Sharing failed:", error));
        } else {
            // Fallback to WhatsApp text sharing
            const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, "_blank");
        }
    };
    

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <section className="container px-6 py-6 flex flex-col justify-center pt-16">
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-6 py-2 rounded-full shadow-lg border-4 border-white text-lg font-bold text-white uppercase">
                Round {totalAnswers}
            </div>
            <Hero />
            <Badge className="bg-sky-300 text-sky-600 text-sm px-4 py-2 rounded-md mb-6">Answer and Score</Badge>
            {/* Clue Section */}
            <QuestionCard className="question text-xl bg-sky-50 p-6 min-h-[120px] max-w-[76rem] rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 transform relative">
                <span className="text-center">
                    {showNextClue ? (
                        <div>
                            <div>
                                <span className="font-bold text-sky-400">Clue 1: </span>
                                {randomDestination.correctDestination.clues[0]}
                            </div>
                            <div>
                                <span className="font-bold text-sky-400">Clue 2: </span>
                                {randomDestination.correctDestination.clues[1]}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <span className="font-bold text-sky-400">Clue 1: </span>
                            {randomDestination.correctDestination.clues[0]}
                        </div>
                    )}
                </span>

                {!showNextClue && (
                    <button
                        onClick={() => setShowNextClue(true)}
                        className="absolute bottom-2 right-2 text-gray-400 px-3 py-1 text-base rounded-xs hover:text-sky-500 transition duration-300"
                    >
                        Next Clue
                    </button>
                )}
            </QuestionCard>

            {/* Options Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full justify-center pt-3 items-center">
                {options.map((option, index) => (
                    <div key={index}>
                        <a href="/#fact-card" className="group flex justify-center">
                        <OptionCard
                            option="Play"
                            disabled={!!selected} // Disable after selection
                            className={`py-5 px-8 w-full max-w-md h-20 rounded-2xl text-center font-bold text-lg transition-all`}
                            onClick={() => checkAnswer(option)}
                        >
                            {option}
                        </OptionCard>
                        </a>
                    </div>
                ))}
            </div>

            {/* Fact & Scorecard (only after selection) */}
            {selected && (
                <div className="mt-10">
                    <Fact isCorrect={correct} fact={randomDestination.correctDestination.fun_fact[0]} onNextGame={nextQuestion} />
                    <div ref={cardRef} id='score-card'>
                        <ScoreCard score={score} correctAnswers={correctAnswers} totalAnswers={totalAnswers} accuracy={accuracy} />
                    </div>

                    <Dialog>
                        <DialogTrigger className="w-full flex justify-center">
                            <button
                                onClick={() => generateImageAndShare(cardRef)}
                                className="bg-green-400 text-white p-2 rounded mt-4 "
                            >
                                Challenge a friend
                            </button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share on whatsapp</DialogTitle>
                                <DialogDescription>
                                    Let them know your score!
                                    {imageUrl && <img src={imageUrl} alt="Score Card" className="w-full rounded-lg" />}
                                    <button className='p-2 mt-2 bg-sky-100 text-black rounded-2xl' onClick={shareImage}>Share</button>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

        </section>
    );
};

export default Quiz;