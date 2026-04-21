"""
AI Assistant Service - RAG Pipeline for Multilingual Agricultural Knowledge
"""

from typing import Optional, List, Dict, Any
import json
import redis
from sqlalchemy.orm import Session
from app.models import AIConversation, KnowledgeBaseDocument, KnowledgeBaseChunk
from app.config import get_settings
from datetime import datetime

settings = get_settings()

# Redis client for conversation caching
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)


class RAGService:
    """Retrieval-Augmented Generation Service for Agricultural Knowledge"""
    
    # Sample knowledge base (in production, use Qdrant vector DB)
    KNOWLEDGE_BASE = {
        "crop_management": [
            {
                "title": "Wheat Cultivation in Northern India",
                "content": """Wheat is a rabi crop best suited for northern India. 
                Sow in October-November for harvest in March-April. 
                Water requirement: 450-650 mm. 
                Suitable varieties: PBW 723, HS 507.
                Apply first irrigation 21-25 days after sowing.""",
                "crops": ["wheat"],
                "regions": ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh"],
                "language": "en"
            },
            {
                "title": "चावल की खेती",
                "content": """चावल खरीफ मौसम की फसल है। 
                जून-जुलाई में बुवाई करें और सितंबर-अक्टूबर में कटाई करें।
                पानी की आवश्यकता: 1000-2000 मिमी।
                उपयुक्त किस्में: बासमती, सोना, आईआर-64।""",
                "crops": ["rice"],
                "regions": ["West Bengal", "Punjab", "Chhattisgarh"],
                "language": "hi"
            }
        ],
        "pest_management": [
            {
                "title": "Armyworm Management in Crops",
                "content": """Armyworms are common pests in wheat and maize.
                Control measures:
                1. Use neem-based pesticides
                2. Manual removal of affected leaves
                3. Spray carbaryl 50 WP or quinalphos 25 EC
                4. Release of egg parasitoid Trichogramma can help""",
                "crops": ["wheat", "maize"],
                "language": "en"
            }
        ],
        "schemes": [
            {
                "title": "PM-KISAN: Pradhan Mantri Kisan Samman Nidhi",
                "content": """PM-KISAN provides direct income support of ₹6,000 per year to eligible farmers.
                Eligibility: All landholding farmers
                Amount: ₹2,000 per installment (3 installments per year)
                Application: Apply on pmkisan.gov.in or through village revenue officer""",
                "source": "Central Government"
            },
            {
                "title": "PMFBY: Pradhan Mantri Fasal Bima Yojana",
                "content": """Crop insurance scheme providing protection against yield loss.
                Premium: 2% for kharif, 1.5% for rabi crops
                Coverage: up to 70-80% of loss
                Claim process: Report losses to agriculture officer within 72 hours""",
                "source": "Central Government"
            }
        ],
        "prices": [
            {
                "title": "Wheat Price Information",
                "content": """Current wheat prices (as of March 2024):
                Delhi Safal Mandi: ₹24.50/kg (min: ₹23, max: ₹26)
                Haryana: ₹23.80/kg (min: ₹22.50, max: ₹25.20)
                UP: ₹23.00/kg""",
                "crop": "wheat"
            }
        ]
    }
    
    @staticmethod
    def retrieve_relevant_chunks(
        db: Session,
        query: str,
        language: str = "en",
        top_k: int = 5,
        category: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Retrieve relevant knowledge base chunks based on query.
        In production, uses Qdrant vector DB with embeddings.
        For now, implements simple keyword matching.
        """
        
        relevant_chunks = []
        
        # Determine category from query
        if not category:
            if any(word in query.lower() for word in ["pest", "disease", "insect", "bug"]):
                category = "pest_management"
            elif any(word in query.lower() for word in ["scheme", "subsidy", "benefit", "pm-kisan", "pmfby"]):
                category = "schemes"
            elif any(word in query.lower() for word in ["price", "market", "mandi", "cost"]):
                category = "prices"
            else:
                category = "crop_management"
        
        # Search knowledge base
        if category in RAGService.KNOWLEDGE_BASE:
            for doc in RAGService.KNOWLEDGE_BASE[category]:
                # Check language match
                if "language" in doc and doc["language"] != language and language != "en":
                    continue
                
                # Simple keyword matching
                query_words = query.lower().split()
                doc_text = (doc.get("title", "") + " " + doc.get("content", "")).lower()
                
                matches = sum(1 for word in query_words if word in doc_text)
                
                if matches > 0:
                    relevant_chunks.append({
                        "title": doc.get("title", ""),
                        "content": doc.get("content", ""),
                        "relevance_score": matches
                    })
        
        # Sort by relevance and return top-k
        relevant_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return relevant_chunks[:top_k]
    
    @staticmethod
    def generate_response(
        db: Session,
        query: str,
        context_chunks: List[Dict[str, str]],
        language: str = "en",
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, str]:
        """
        Generate response using LLM (GPT-4o/Gemini) with RAG context.
        In production, calls OpenAI API or Google Gemini API.
        """
        
        # Construct context string
        context_text = "\n\n".join([
            f"**{chunk['title']}**\n{chunk['content']}"
            for chunk in context_chunks
        ])
        
        # For demo, generate response using template
        # In production, integrate with LLM API
        
        if context_chunks:
            response = f"""Based on the relevant information I found:

{context_text}

This information should help answer your query about {query}. 
For more detailed information, please consult the government portals or contact your local agriculture officer."""
        else:
            response = f"""I don't have specific information about '{query}' in my knowledge base.
Please consult:
- Your local Krishi Vigyan Kendra (KVK)
- Government of India agriculture portal (agriculture.gov.in)
- Kisan Call Centre: 1551 (toll-free)"""
        
        return {
            "response": response,
            "language": language,
            "context_chunks": context_chunks
        }


class AIAssistantService:
    """AI Assistant Chat Management"""
    
    @staticmethod
    def start_conversation(db: Session, user_id: str) -> str:
        """Start new conversation session"""
        
        new_conversation = AIConversation(
            user_id=user_id,
        )
        
        db.add(new_conversation)
        db.commit()
        db.refresh(new_conversation)
        
        return new_conversation.session_id
    
    @staticmethod
    def get_conversation_history(db: Session, session_id: str) -> Optional[AIConversation]:
        """Get conversation history"""
        return db.query(AIConversation).filter(
            AIConversation.session_id == session_id
        ).first()
    
    @staticmethod
    def add_message_to_conversation(
        db: Session,
        session_id: str,
        role: str,
        content: str,
        language: str = "en"
    ) -> None:
        """Add message to conversation"""
        
        conversation = db.query(AIConversation).filter(
            AIConversation.session_id == session_id
        ).first()
        
        if not conversation:
            return
        
        # Get current messages
        messages = conversation.messages or []
        
        # Add new message
        messages.append({
            "role": role,
            "content": content,
            "language": language,
            "timestamp": datetime.now().isoformat()
        })
        
        # Update conversation
        conversation.messages = messages
        conversation.updated_at = datetime.now()
        
        db.commit()
    
    @staticmethod
    def process_chat_query(
        db: Session,
        query: str,
        session_id: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Process chat query:
        1. Detect language
        2. Retrieve relevant documents
        3. Generate response
        4. Save to conversation
        """
        
        # Get conversation
        conversation = db.query(AIConversation).filter(
            AIConversation.session_id == session_id
        ).first()
        
        if not conversation:
            return {"error": "Conversation not found"}
        
        # Retrieve relevant chunks from knowledge base
        context_chunks = RAGService.retrieve_relevant_chunks(
            db,
            query,
            language,
            top_k=5
        )
        
        # Get conversation history
        conversation_history = conversation.messages if conversation.messages else []
        
        # Generate response
        response_data = RAGService.generate_response(
            db,
            query,
            context_chunks,
            language,
            conversation_history
        )
        
        # Add user query and assistant response to conversation
        AIAssistantService.add_message_to_conversation(
            db, session_id, "user", query, language
        )
        AIAssistantService.add_message_to_conversation(
            db, session_id, "assistant", response_data["response"], language
        )
        
        # Update context chunks in conversation
        conversation.context_chunks = json.dumps(context_chunks)
        conversation.updated_at = datetime.now()
        db.commit()
        
        return {
            "message": response_data["response"],
            "language": language,
            "session_id": session_id,
            "context_chunks": context_chunks,
            "suggestions": AIAssistantService._generate_suggestions(query, language)
        }
    
    @staticmethod
    def _generate_suggestions(query: str, language: str) -> List[str]:
        """Generate follow-up suggestions based on query"""
        
        suggestions = {
            "crop": [
                "Show me mandi prices for this crop",
                "Tell me about pest management",
                "When should I sow this crop?"
            ],
            "weather": [
                "How much water does this crop need?",
                "What are the current weather forecasts?",
                "When is the best time to harvest?"
            ],
            "scheme": [
                "Am I eligible for this scheme?",
                "How do I apply?",
                "What documents do I need?"
            ]
        }
        
        # Simple keyword matching to determine category
        if any(word in query.lower() for word in ["scheme", "subsidy", "benefit"]):
            return suggestions.get("scheme", [])
        elif any(word in query.lower() for word in ["weather", "rain", "water"]):
            return suggestions.get("weather", [])
        else:
            return suggestions.get("crop", [])


class VoiceService:
    """Voice Input/Output Service"""
    
    @staticmethod
    async def transcribe_audio(audio_file_url: str, language: str) -> str:
        """
        Transcribe audio to text using Whisper or Bhashini ASR.
        In production, integrate with OpenAI Whisper or Bhashini API.
        """
        
        # TODO: Implement with OpenAI Whisper or Bhashini
        return "Transcribed text from audio"
    
    @staticmethod
    async def synthesize_speech(text: str, language: str) -> str:
        """
        Convert text to speech using Bhashini or gTTS.
        Returns audio file URL.
        """
        
        # TODO: Implement with Bhashini TTS or Google Text-to-Speech
        return "audio.mp3"
