const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Enhanced readings data for fallback
const enhancedReadingsData = {
  'Online Grocery Shopping Basics': {
    content: `Online grocery shopping has revolutionized how we purchase food and household essentials. This comprehensive guide will walk you through every step of the process, from setting up accounts to receiving your groceries at your doorstep.

**Getting Started**

Before you begin shopping online, you'll need to choose a platform. Popular options include:
- **Instacart**: Partners with local stores like Safeway, Costco, and CVS
- **Amazon Fresh**: Amazon's grocery delivery service
- **Store-specific apps**: Many grocery chains have their own apps (Target, Walmart, Kroger)

**Creating Your Account**

1. Download the app or visit the website
2. Enter your email address and create a secure password
3. Add your delivery address - be specific about apartment numbers or special instructions
4. Add a payment method (credit card, debit card, or digital wallet)

**Building Your Shopping List**

Start by browsing categories or using the search function. Most apps organize items by:
- Fresh produce (fruits, vegetables)
- Dairy and eggs
- Meat and seafood
- Pantry staples
- Frozen foods
- Household items

**Smart Shopping Tips**

- Check weekly ads and digital coupons before shopping
- Read product descriptions carefully, especially for produce
- Pay attention to quantity and size when comparing prices
- Use the "notes" feature to specify ripeness preferences for fruits
- Consider substitution preferences in case items are out of stock

**Checkout and Delivery**

When you're ready to checkout:
1. Review your cart and quantities
2. Select delivery time (same-day, next-day, or scheduled)
3. Add any special delivery instructions
4. Review your total, including fees and tip
5. Confirm your order

**Safety and Quality**

- Check expiration dates when your groceries arrive
- Inspect fresh items for quality
- Keep receipts for returns or issues
- Rate your shopper to help improve the service

Online grocery shopping saves time and can help you stick to a budget by avoiding impulse purchases. With practice, you'll become efficient at finding what you need and ensuring you get quality products delivered to your door.`,
    discussion_questions: [
      "What are the main advantages of online grocery shopping compared to shopping in-store?",
      "How would you handle a situation where some items in your order are out of stock?",
      "What safety measures would you take when providing delivery instructions for your home?",
      "How might online grocery shopping change your meal planning habits?"
    ]
  },
  'Understanding Gen Z Slang': {
    content: `Digital communication has transformed how we connect with family, friends, and the broader world. Understanding these new forms of communication can help you stay connected with loved ones and participate more fully in online communities.

**Text Messaging Evolution**

Text messaging has evolved far beyond simple SMS. Today's messaging includes:
- **Emojis and Reactions**: Visual ways to express emotions
- **Voice Messages**: Speaking instead of typing
- **Photo and Video Sharing**: Instant visual communication
- **Group Chats**: Conversations with multiple people at once

**Social Media Communication**

Each platform has its own communication style:
- **Facebook**: Longer posts, photo albums, event invitations
- **Instagram**: Photo-focused with brief captions and stories
- **Twitter**: Short, quick thoughts and news sharing
- **TikTok**: Short video content with comments

**Understanding Online Language**

Digital communication often uses shortened forms:
- **Acronyms**: LOL (laugh out loud), BRB (be right back), TTYL (talk to you later)
- **Abbreviations**: U (you), ur (your/you're), thru (through)
- **Informal spelling**: Sometimes people type quickly and make intentional spelling changes

**Generational Communication Styles**

Different age groups communicate differently online:
- **Younger generations** might use more slang, memes, and casual language
- **Older generations** often prefer complete sentences and formal structure
- **Middle generations** blend both styles depending on the context

**Communication Etiquette**

Good digital communication includes:
- Responding in a reasonable time frame
- Being clear about your meaning
- Using appropriate language for the platform
- Respecting others' privacy and boundaries
- Not sharing personal information publicly

**Staying Safe While Communicating**

- Be cautious about sharing personal details with strangers
- Verify the identity of people you meet online
- Report inappropriate behavior or spam
- Keep your privacy settings updated

**Building Meaningful Connections**

Digital communication can enhance relationships when used thoughtfully:
- Share genuine updates about your life
- Ask questions to show interest in others
- Use video calls for more personal conversations
- Remember that tone can be hard to convey in text

Understanding these communication styles helps you connect better with people of all ages and feel more confident participating in digital conversations.`,
    discussion_questions: [
      "How has digital communication changed the way families stay in touch?",
      "What challenges might arise when communicating across different generations online?",
      "How can you tell if an online message is from someone trustworthy?",
      "What are some ways to make your digital communications more meaningful and personal?"
    ]
  }
};

// Get all readings
router.get('/', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  db.all('SELECT * FROM readings ORDER BY created_at DESC', (err, readings) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch readings' });
    }
    
    // Enhance readings with fallback data if discussion_questions is missing
    const enhancedReadings = readings.map(reading => {
      const enhancement = enhancedReadingsData[reading.title];
      if (enhancement && !reading.discussion_questions) {
        return {
          ...reading,
          content: enhancement.content,
          discussion_questions: JSON.stringify(enhancement.discussion_questions)
        };
      }
      return reading;
    });
    
    res.json(enhancedReadings);
  });
});

// Get reading by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT * FROM readings WHERE id = ?', [id], (err, reading) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch reading' });
    }
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    
    // Enhance reading with fallback data if discussion_questions is missing
    const enhancement = enhancedReadingsData[reading.title];
    if (enhancement && !reading.discussion_questions) {
      reading = {
        ...reading,
        content: enhancement.content,
        discussion_questions: JSON.stringify(enhancement.discussion_questions)
      };
    }
    
    res.json(reading);
  });
});

// Search readings by topic tags or difficulty
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  const searchQuery = `SELECT * FROM readings 
                       WHERE title LIKE ? OR topic_tags LIKE ? OR difficulty_level = ?
                       ORDER BY created_at DESC`;
  
  const searchTerm = `%${query}%`;
  
  db.all(searchQuery, [searchTerm, searchTerm, query], (err, readings) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to search readings' });
    }
    res.json(readings);
  });
});

module.exports = router;