import axios from 'axios';

const API_BASE_URL = '/api/alphaforge';

export interface TeamDTO {
  id?: number;
  name: string;
  teamSize: number;
  capital?: number;
  isTop10?: boolean;
}

export interface IdeaDTO {
  id?: number;
  title: string;
  description: string;
  poster: string;
  currentBid?: number;
  highestBidder?: any;
  sold?: boolean;
  ownerTeam?: any;
}

export interface IdeaRequestDTO {
  teamId: number;
  title: string;
  description: string;
  posterUrl: string;
}

export interface ResultDTO {
  id?: number;
  bestInnovator?: any;
  bestInvestor?: any;
  visionary?: any;
  eventSummary?: string;
}

export const getAllTeams = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teams`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const registerTeam = async (team: TeamDTO) => {
  try {
    console.log('Sending team registration data:', team);
    const response = await axios.post(`${API_BASE_URL}/register`, team);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering team:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getAllIdeas = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ideas`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ideas:', error);
    throw error;
  }
};

export const submitIdea = async (ideaRequest: IdeaRequestDTO) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add-idea`, ideaRequest);
    return response.data;
  } catch (error) {
    console.error('Error submitting idea:', error);
    throw error;
  }
};

export const placeBid = async (teamId: number, ideaId: number, bidAmount: number) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/raise-bid?teamId=${teamId}&ideaId=${ideaId}&bidAmount=${bidAmount}`
    );
    return response.data;
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
};

export const sellIdea = async (ideaId: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sell-idea?ideaId=${ideaId}`);
    return response.data;
  } catch (error) {
    console.error('Error selling idea:', error);
    throw error;
  }
};

export const getResults = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/result`);
    return response.data;
  } catch (error) {
    console.error('Error fetching results:', error);
    throw error;
  }
};

export const getHighestBidder = async (ideaId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/highest-bidder?ideaId=${ideaId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching highest bidder:', error);
    throw error;
  }
};