import React, { useState, useEffect } from 'react';
import { Rocket, Star, PlusCircle, CircleDollarSign, Lightbulb, Award, ArrowLeft, Zap, Home, PenTool, FileText, Users } from 'lucide-react';
import FlipClock from './components/FlipClock';
import Comet from './components/Comet';
import Sparkle from './components/Sparkle';
import { getAllTeams, registerTeam, getAllIdeas, submitIdea, placeBid, sellIdea, getResults } from './services/api';
import axios from 'axios';

interface Team {
  id: number;
  name: string;
  imageUrl: string;
  members: number;
  budget: number;
  originalBudget: number;
  currentBid?: number;
}

interface AuctionItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  highestBid: number;
  highestBidder: string | null;
  sold: boolean;
  submittedBy?: string;
}

const initialTeams: Team[] = [
  {
    id: 1,
    name: "Quantum Ventures",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    members: 5,
    budget: 2000000,
    originalBudget: 2000000
  },
  {
    id: 2,
    name: "Future Forge",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    members: 4,
    budget: 2000000,
    originalBudget: 2000000
  },
  {
    id: 3,
    name: "Nova Nexus",
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
    members: 3,
    budget: 2000000,
    originalBudget: 2000000
  },
  {
    id: 4,
    name: "Stellar Solutions",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
    members: 5,
    budget: 2000000,
    originalBudget: 2000000
  },
  {
    id: 5,
    name: "Infinity Labs",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    members: 4,
    budget: 2000000,
    originalBudget: 2000000
  },
  {
    id: 6,
    name: "Phoenix Dynamics",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
    members: 3,
    budget: 2000000,
    originalBudget: 2000000
  }
];

const initialItems: AuctionItem[] = [
  {
    id: 1,
    name: "Smart Campus Navigation",
    description: "AI-powered mobile app for efficient campus navigation and resource location. Features include real-time indoor navigation, classroom availability tracking, and crowd density monitoring for optimal route planning.",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    basePrice: 50000,
    highestBid: 50000,
    highestBidder: null,
    sold: false,
    submittedBy: "Quantum Ventures"
  },
  {
    id: 2,
    name: "EcoTech Waste Management",
    description: "IoT-based smart waste management system for sustainable campus. Implements smart bins with fill-level monitoring, automated sorting, and analytics dashboard for optimization of collection routes.",
    imageUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800",
    basePrice: 50000,
    highestBid: 50000,
    highestBidder: null,
    sold: false,
    submittedBy: "Future Forge"
  },
  {
    id: 3,
    name: "Virtual Study Buddy",
    description: "AR/VR platform for collaborative learning and virtual study groups. Features include 3D visualization of complex concepts, virtual laboratories, and real-time collaboration tools.",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
    basePrice: 50000,
    highestBid: 50000,
    highestBidder: null,
    sold: false,
    submittedBy: "Nova Nexus"
  }
];

function formatIndianNumber(amount: number): string {
  const numStr = amount.toString();
  const parts = [];
  
  let remaining = numStr;
  if (numStr.length > 3) {
    parts.unshift(numStr.slice(-3));
    remaining = numStr.slice(0, -3);
  } else {
    parts.unshift(numStr);
    remaining = "";
  }
  
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2);
    parts.unshift(chunk);
    remaining = remaining.slice(0, -2);
  }
  
  return parts.join(',');
}

function formatCurrency(amount: number) {
  return (
    <span className="flex items-center">
      <span className="mr-1">₹</span>
      {formatIndianNumber(amount)}
    </span>
  );
}

// Add this at the top of your file, before the component
const scrollbarHidingStyle = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  body::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  body {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    overflow-x: hidden;
  }
  
  * {
    scrollbar-width: none;
  }
  
  *::-webkit-scrollbar {
    display: none;
  }
`;

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [items, setItems] = useState<AuctionItem[]>(initialItems);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedItem, setSelectedItem] = useState<AuctionItem>(initialItems[0]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSoldAnimation, setShowSoldAnimation] = useState(false);
  const [soldItem, setSoldItem] = useState<AuctionItem | null>(null);
  const [comets, setComets] = useState<{x: number, y: number, color: string, size: number, duration: number}[]>([]);
  const [sparkles, setSparkles] = useState<{x: number, y: number, color: string, size: number}[]>([]);
  const [showIdeaSubmission, setShowIdeaSubmission] = useState(false);
  const [showTeamRegistrationPage, setShowTeamRegistrationPage] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    members: 3,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    budget: 2000000,
    originalBudget: 2000000
  });
  const [newIdea, setNewIdea] = useState({
    name: '',
    description: '',
    imageUrl: '',
    basePrice: 50000,
    submittedBy: ''
  });

  const getBidIncrement = (currentBid: number) => {
    if (currentBid < 500000) {
      return 50000;
    } else if (currentBid < 2000000) {
      return 100000;
    } else {
      return 200000;
    }
  };

  const handleBid = async () => {
    if (selectedTeam && selectedItem && !selectedItem.sold) {
      if (selectedItem.submittedBy === selectedTeam.name) {
        alert('You cannot bid on your own idea!');
        return;
      }
      
      const increment = getBidIncrement(selectedItem.highestBid);
      const newBidAmount = selectedItem.highestBid + increment;
      
      // Do a strict check on the client side first to prevent unnecessary API calls
      if (selectedTeam.budget < newBidAmount) {
        alert('Insufficient budget to place this bid.');
        return;
      }
      
      try {
        const response = await placeBid(selectedTeam.id, selectedItem.id, newBidAmount);
        
        // Check if the response contains an error message
        if (typeof response === 'string' && response.includes('Insufficient')) {
          alert(response);
          return;
        }
        
        // Use refreshAllData to get updated balances and other data
        await refreshAllData();
        
        // Additional UI updates specifically for bidding
        setSelectedItem(prev => ({
          ...prev,
          highestBid: newBidAmount,
          highestBidder: selectedTeam.name
        }));
        
      } catch (error: any) {
        console.error('Error placing bid:', error);
        
        // Handle specific API error messages
        if (error.response && error.response.data) {
          alert(`Failed to place bid: ${error.response.data}`);
        } else {
          alert('Failed to place bid. Please try again.');
        }
      }
    }
  };

  const handleDirectBuy = async () => {
    if (selectedTeam && selectedItem && !selectedItem.sold) {
      if (selectedItem.submittedBy === selectedTeam.name) {
        alert('You cannot buy your own idea!');
        return;
      }
      
      if (selectedTeam.budget >= selectedItem.basePrice) {
        try {
          // Remove optimistic UI updates - rely only on server data
          
          const bidResponse = await placeBid(selectedTeam.id, selectedItem.id, selectedItem.basePrice);
          
          // Check if the response contains an error message
          if (typeof bidResponse === 'string' && bidResponse.includes('Insufficient')) {
            alert(bidResponse);
            return;
          }
          
          const sellResponse = await sellIdea(selectedItem.id);
          
          // If there's an error message in the response, show it and return
          if (typeof sellResponse === 'string' && (
              sellResponse.includes('insufficient') || 
              sellResponse.includes('Insufficient')
          )) {
            alert(sellResponse);
            return;
          }
          
          // Use the refreshAllData function to update all data
          await refreshAllData();
          
          // Show sold animation
          setShowSoldAnimation(true);
          setSoldItem(selectedItem);
          createCelebrationEffects();
          
          setTimeout(() => {
            setShowSoldAnimation(false);
            setSoldItem(null);
          }, 10000);
        } catch (error: any) {
          console.error('Error with direct buy:', error);
          // Handle specific API error messages
          if (error.response && error.response.data) {
            alert(`Failed to complete purchase: ${error.response.data}`);
          } else {
            alert('Failed to complete purchase. Please try again.');
          }
        }
      } else {
        alert('Insufficient budget to purchase this idea.');
      }
    }
  };

  const createCelebrationEffects = () => {
    const colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffffff'];
    const newComets = [];
    const newSparkles = [];
    
    for (let i = 0; i < 20; i++) {
      newComets.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 2
      });
    }
    
    for (let i = 0; i < 80; i++) {
      newSparkles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1
      });
    }
    
    setComets(newComets);
    setSparkles(newSparkles);
    
    setTimeout(() => {
      setComets([]);
      setSparkles([]);
    }, 10000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewIdea(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const teamData = {
        name: newTeam.name,
        teamSize: newTeam.members
      };
      
      console.log('Submitting team data:', teamData);
      
      const registeredTeam = await registerTeam(teamData);
      
      const transformedTeam = {
        id: registeredTeam.id,
        name: registeredTeam.name,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
        members: registeredTeam.teamSize,
        budget: registeredTeam.capital || 2000000,
        originalBudget: registeredTeam.capital || 2000000
      };
      
      setTeams([...teams, transformedTeam]);
      setShowTeamRegistrationPage(false);
      setNewTeam({
        name: '',
        members: 3, 
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800', 
        budget: 2000000, 
        originalBudget: 2000000 
      });
      
      alert('Team registered successfully!');
    } catch (error) {
      console.error('Error registering team:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          alert(`Registration failed: ${error.response.data?.message || error.response.statusText || 'Server error'}`);
        } else if (error.request) {
          alert('Cannot connect to the server. Please check your connection.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Failed to register team. Please try again.');
      }
    }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.submittedBy) {
      alert("Please select a team");
      return;
    }
    
    try {
      const submittingTeam = teams.find(team => team.name === newIdea.submittedBy);
      if (!submittingTeam) {
        alert("Selected team not found");
        return;
      }
      
      const ideaRequest = {
        teamId: submittingTeam.id,
        title: newIdea.name,
        description: newIdea.description,
        posterUrl: newIdea.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
      };
      
      const addedIdea = await submitIdea(ideaRequest);
      
      const transformedIdea = {
        id: addedIdea.id,
        name: addedIdea.title,
        description: addedIdea.description,
        imageUrl: addedIdea.poster,
        basePrice: 50000,
        highestBid: 50000,
        highestBidder: null,
        sold: false,
        submittedBy: newIdea.submittedBy
      };
      
      setItems([...items, transformedIdea]);
      setShowIdeaSubmission(false);
      setNewIdea({
        name: '',
        description: '',
        imageUrl: '',
        basePrice: 50000,
        submittedBy: ''
      });
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert('Failed to submit idea. Please try again.');
    }
  };

  const fetchResults = async () => {
    try {
      const resultData = await getResults();
      console.log('Results:', resultData);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
    fetchResults();
  };

  const refreshAllData = async () => {
    try {
      // Refresh all team data
      const teamsData = await getAllTeams();
      const transformedTeams = teamsData.map((team: any) => ({
        id: team.id,
        name: team.name,
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
        members: team.teamSize,
        budget: team.capital,
        originalBudget: team.capital
      }));
      setTeams(transformedTeams.length > 0 ? transformedTeams : initialTeams);
      
      // Update selected team if still selected
      if (selectedTeam) {
        const updatedSelectedTeam = transformedTeams.find((team: any) => team.id === selectedTeam.id);
        if (updatedSelectedTeam) {
          setSelectedTeam(updatedSelectedTeam);
        }
      }
      
      // Refresh all idea data
      const ideasData = await getAllIdeas();
      const transformedIdeas = ideasData.map((idea: any) => ({
        id: idea.id,
        name: idea.title,
        description: idea.description,
        imageUrl: idea.poster || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
        basePrice: 50000,
        highestBid: idea.currentBid || 50000,
        highestBidder: idea.highestBidder?.name || null,
        sold: idea.sold || false,
        submittedBy: idea.ownerTeam?.name || "Unknown Team"
      }));
      setItems(transformedIdeas.length > 0 ? transformedIdeas : initialItems);
      
      // Update selected item if still selected
      if (selectedItem) {
        const updatedSelectedItem = transformedIdeas.find((item: { id: number }) => item.id === selectedItem.id);
        if (updatedSelectedItem) {
          setSelectedItem(updatedSelectedItem);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsData = await getAllTeams();
        const transformedTeams = teamsData.map((team: any) => ({
          id: team.id,
          name: team.name,
          imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
          members: team.teamSize,
          budget: team.capital,
          originalBudget: team.capital
        }));
        setTeams(transformedTeams.length > 0 ? transformedTeams : initialTeams);

        const ideasData = await getAllIdeas();
        const transformedIdeas = ideasData.map((idea: any) => ({
          id: idea.id,
          name: idea.title,
          description: idea.description,
          imageUrl: idea.poster || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
          basePrice: 50000,
          highestBid: idea.currentBid || 50000,
          highestBidder: idea.highestBidder?.name || null,
          sold: idea.sold || false,
          submittedBy: idea.ownerTeam?.name || "Unknown Team"
        }));
        setItems(transformedIdeas.length > 0 ? transformedIdeas : initialItems);
        if (transformedIdeas.length > 0) {
          setSelectedItem(transformedIdeas[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTeams(initialTeams);
        setItems(initialItems);
      }
    };

    fetchData();
  }, []);

  // Add this effect to inject the style when the component mounts
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = scrollbarHidingStyle;
    
    // Append to head
    document.head.appendChild(styleElement);
    
    // Cleanup on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (showLanding) {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=3000')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 backdrop-blur-sm" />
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-full h-full animate-pulse">
            <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/4" style={{ boxShadow: '0 0 20px #ffffff' }} />
            <div className="absolute w-2 h-2 bg-gray-300 rounded-full top-3/4 right-1/4" style={{ boxShadow: '0 0 20px #d1d5db' }} />
            <div className="absolute w-2 h-2 bg-white rounded-full bottom-1/4 left-1/3" style={{ boxShadow: '0 0 20px #ffffff' }} />
            <div className="absolute w-2 h-2 bg-gray-300 rounded-full top-1/2 right-1/3" style={{ boxShadow: '0 0 20px #d1d5db' }} />
          </div>
        </div>
        
        <div className="absolute top-0 right-4 py-4 px-6 z-10 flex items-center space-x-0">
          <div className="scale-75 flex items-center"> 
            <FlipClock />
          </div>
        </div>

        <div className="relative text-center p-8 max-w-4xl">
          <div className="mb-8 relative inline-block">
            <div className="relative">
              <img 
                src="/src/assets/AlphaForgeLogo.png" 
                alt="AlphaForge Logo" 
                className="w-auto object-contain"
                style={{ height: '10.5rem' }}
              />
            </div>
          </div>
          <div className="relative">
            <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
              AlphaForge{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 animate-pulse">
                  2.0
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white to-gray-400 blur-lg opacity-50 animate-pulse" />
              </span>
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-white to-gray-400 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          </div>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed backdrop-blur-sm bg-black/20 p-6 rounded-xl">
            AlphaForge 2.0 is a dynamic three-day biotechnology innovation challenge that brings together brilliant minds eager to transform ideas into real-world impact. Designed to foster entrepreneurial thinking and strategic decision-making, the event provides a high-energy platform for innovators to showcase their cutting-edge solutions. A ₹35K cash prize pool awaits the best innovators, while aspiring investors can compete for the Best Investor Award by strategically bidding on top ideas. AlphaForge 2.0 is more than a competition—it's a catalyst for future biotech leaders, where innovation, resilience, and ambition take center stage
          </p>
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform">
              <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Creation</h3>
              <p className="text-gray-200">Craft groundbreaking ideas to life through innovation, strategy, and problem-solving</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Auction</h3>
              <p className="text-gray-200">Compete in a high-stakes bidding war to secure game-changing ventures</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 transform hover:scale-105 transition-transform">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Domination</h3>
              <p className="text-gray-200">Master the startup battlefield and conquer the Investor Mindset</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowLanding(false)}
              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 px-8 rounded-lg font-semibold text-xl hover:opacity-90 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-white/20"
            >
              Enter Auction Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showTeamRegistrationPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => setShowTeamRegistrationPage(false)}
            className="flex items-center gap-2 text-white mb-8 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Auction
          </button>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <Users className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Register New Team</h1>
            </div>
            
            <form onSubmit={handleRegisterTeam} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  className="w-full bg-white bg-opacity-20 rounded-lg px-4 py-3 text-white"
                  placeholder="e.g., Quantum Innovators"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Number of Members (3-5)</label>
                <input
                  type="number"
                  value={newTeam.members}
                  onChange={(e) => setNewTeam({...newTeam, members: parseInt(e.target.value)})}
                  className="w-full bg-white bg-opacity-20 rounded-lg px-4 py-3 text-white"
                  min="3"
                  max="5"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">Teams must have between 3 and 5 members</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mt-6">
                <h3 className="text-lg font-bold text-white mb-2">Team Budget</h3>
                <p className="text-3xl font-bold text-white flex items-center">
                  {formatCurrency(newTeam.budget)}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Each team starts with ₹20,00,000 Innovation Bucks to bid on projects
                </p>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Register Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowTeamRegistrationPage(false)}
                  className="flex-1 bg-white bg-opacity-20 text-white py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showIdeaSubmission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => setShowIdeaSubmission(false)}
            className="flex items-center gap-2 text-white mb-8 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Auction
          </button>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <PenTool className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Submit New Idea</h1>
            </div>
            
            <form onSubmit={handleSubmitIdea} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Submitting Team</label>
                <select 
                  value={newIdea.submittedBy}
                  onChange={(e) => setNewIdea({...newIdea, submittedBy: e.target.value})}
                  className="w-full bg-white bg-opacity-20 rounded-lg px-4 py-3 text-white"
                  required
                >
                  <option value="">Select your team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Idea Name</label>
                <input
                  type="text"
                  value={newIdea.name}
                  onChange={(e) => setNewIdea({...newIdea, name: e.target.value})}
                  className="w-full bg-white bg-opacity-20 rounded-lg px-4 py-3 text-white"
                  placeholder="e.g., Sustainable Campus Energy Solution"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                  className="w-full bg-white bg-opacity-20 rounded-lg px-4 py-3 text-white min-h-[350px]"
                  placeholder="Describe your innovative idea in detail..."
                  required
                />
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">Base Price</h3>
                <p className="text-2xl font-bold text-white flex items-center">
                  {formatCurrency(50000)}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  All ideas start with a base price of ₹50,000 Innovation Bucks
                </p>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Idea Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-white bg-opacity-20 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <p className="text-gray-400 text-sm mt-1">Upload an image that represents your idea (optional)</p>
              </div>
              
              {newIdea.imageUrl && (
                <div className="mt-4">
                  <p className="text-gray-300 mb-2">Image Preview:</p>
                  <div className="w-full h-48 overflow-hidden rounded-lg">
                    <img 
                      src={newIdea.imageUrl} 
                      alt="Idea preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Submit Idea
                </button>
                <button
                  type="button"
                  onClick={() => setShowIdeaSubmission(false)}
                  className="flex-1 bg-white bg-opacity-20 text-white py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
        <div className="container mx-auto">
          <button
            onClick={() => setShowResults(false)}
            className="flex items-center gap-2 text-white mb-8 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Auction
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-12 text-center">Auction Results</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.filter(item => item.sold).map((item) => (
              <div key={item.id} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
                <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>
                <div className="flex items-center gap-2 text-gray-300 mb-4">
                  <Award className="h- 5 w-5" />
                  <span>Won by: <strong>{item.highestBidder}</strong></span>
                </div>
                <p className="text-white font-bold flex items-center">
                  Final Price: {formatCurrency(item.highestBid)}
                </p>
                {item.submittedBy && (
                  <p className="text-gray-400 mt-2 text-sm">
                    Idea submitted by: {item.submittedBy}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden flex flex-col">
      {comets.map((comet, index) => (
        <Comet key={`comet-${index}`} x={comet.x} y={comet.y} color={comet.color} size={comet.size} duration={comet.duration} />
      ))}
      
      {sparkles.map((sparkle, index) => (
        <Sparkle key={`sparkle-${index}`} x={sparkle.x} y={sparkle.y} color={sparkle.color} size={sparkle.size} />
      ))}
      
      <header className="py-4 px-4 bg-black bg-opacity-30 backdrop-blur-md z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img 
                  src="/src/assets/AlphaForgeLogo.png" 
                  alt="AlphaForge Logo" 
                  className="h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105 animate-pulse" 
                />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-20 rounded-full blur-md transition-opacity duration-300"></div>
              </div>
              <h1 className="text-3xl font-bold text-white">AlphaForge <span className="text-gray-300">2.0</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTeamRegistrationPage(true)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <Users className="h-5 w-5" />
              Register Team
            </button>
            <button
              onClick={() => setShowIdeaSubmission(true)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <PenTool className="h-5 w-5" />
              Submit Idea
            </button>
            <button
              onClick={() => setShowLanding(true)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <Home className="h-5 w-5" />
              Home
            </button>
            <button
              onClick={handleShowResults}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <Award className="h-5 w-5" />
              Results
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col container mx-auto px-4 py-4">
        <div className="flex-none min-h-[40vh] mb-4">
          <div className="h-full bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden">
            <div className="flex justify-center gap-3 mb-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`px-3 py-1.5 rounded-full transition-all text-sm ${
                    selectedItem.id === item.id
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-3rem)]">

              <div className="relative overflow-hidden rounded-xl h-full">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-white mb-1">{selectedItem.name}</h2>
                    {selectedItem.highestBidder && (
                      <div className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
                        <p className="text-white text-sm">
                          Current Leader: <span className="font-bold">{selectedItem.highestBidder}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="mb-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 min-h-[200px]">
  <p className="text-gray-200 text-lg leading-loose">
    {selectedItem.description}
  </p>
</div>


                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-4 text-center">
                    <h3 className="text-lg font-bold text-white mb-1">Current Bid</h3>
                    <p className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                      {formatCurrency(selectedItem.highestBid)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  {selectedTeam && !selectedItem.sold && (
                    <div>
                      {!selectedItem.highestBidder && (
                        <button
                          onClick={handleDirectBuy}
                          className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity border border-white/20 text-sm mb-2"
                          disabled={selectedItem.submittedBy === selectedTeam?.name}
                        >
                          Buy Now at {formatCurrency(selectedItem.basePrice)}
                        </button>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleBid}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                          disabled={!selectedTeam || selectedItem.sold}
                        >
                          Place Bid
                        </button>
                        
                        {selectedItem.highestBidder && (
                          <button
                            onClick={async () => {
                              if (selectedItem && selectedItem.highestBidder) {
                                try {
                                  // Find the buying team object
                                  const buyingTeam = teams.find(team => team.name === selectedItem.highestBidder);
                                  
                                  // Check if buyer has sufficient funds
                                  if (!buyingTeam) {
                                    alert('Buyer team not found.');
                                    return;
                                  }
                                  
                                  if (buyingTeam.budget < selectedItem.highestBid) {
                                    alert(`${buyingTeam.name} has insufficient funds to complete this purchase.`);
                                    return;
                                  }
                                  
                                  // Execute sell on the backend
                                  const response = await sellIdea(selectedItem.id);
                                  
                                  // If there's an error message in the response, show it and return
                                  if (typeof response === 'string' && (
                                      response.includes('insufficient') || 
                                      response.includes('Insufficient')
                                  )) {
                                    alert(response);
                                    return;
                                  }
                                  
                                  // Use refreshAllData function to update all data
                                  await refreshAllData();
                                  
                                  // Show sold animation
                                  setShowSoldAnimation(true);
                                  setSoldItem(selectedItem);
                                  createCelebrationEffects();
                                  
                                  setTimeout(() => {
                                    setShowSoldAnimation(false);
                                    setSoldItem(null);
                                  }, 10000);
                                } catch (error: any) {
                                  console.error('Error selling idea:', error);
                                  if (error.response && error.response.data) {
                                    alert(`Failed to sell idea: ${error.response.data}`);
                                  } else {
                                    alert('Failed to sell idea. Please try again.');
                                  }
                                }
                              }
                            }}
                            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity border border-white/20"
                          >
                            Sell Idea
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedItem.sold && (
                    <div className="inline-block w-full px-4 py-2 bg-gray-700 bg-opacity-30 rounded-lg text-center">
                      <p className="text-white">
                        Sold to <span className="font-bold">{selectedItem.highestBidder}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[50vh]">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Competing Teams</h2>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTeam?.id === team.id 
                      ? 'bg-gradient-to-br from-gray-700/70 to-gray-900/70 border-2 border-white/30' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-semibold text-white text-sm mb-2 truncate w-full">{team.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-gray-300 text-xs">
                      <CircleDollarSign className="h-3 w-3" />
                      <span>{formatIndianNumber(team.budget)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showSoldAnimation && soldItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <h2 className="text-6xl font-bold text-white mb-4">SOLD!</h2>
            <p className="text-3xl text-white">
              Congratulations to <span className="font-bold">{soldItem.highestBidder}</span>
            </p>
            <p className="text-2xl text-gray-300 mt-2 flex items-center justify-center">
              Final Price: {formatCurrency(soldItem.highestBid)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;