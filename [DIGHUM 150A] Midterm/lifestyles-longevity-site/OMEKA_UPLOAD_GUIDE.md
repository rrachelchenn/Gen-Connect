# Guide: Adding Items to Your Omeka Site

## Your Omeka Site Details
- **Site URL**: https://bluezonesnow.omeka.net
- **Admin URL**: https://bluezonesnow.omeka.net/admin/
- **Site Title**: "How We Live Now: Modern Lifestyles in Archive"

## Steps to Add Items

### 1. Login to Your Omeka Admin Panel
1. Go to: https://bluezonesnow.omeka.net/admin/
2. Enter your username and password
3. Click "Remember Me" if desired

### 2. Add New Items
1. Once logged in, click **"Items"** in the left navigation
2. Click **"Add an item"** 
3. Fill out the metadata fields using the data from `omeka-metadata-items.json`

### 3. Essential Fields to Fill
For each item, use this metadata structure:

#### Core Dublin Core Fields:
- **Title**: (e.g., "Maria's Morning Routine Documentation")
- **Description**: (Full description from JSON)
- **Creator**: (e.g., "Maria Santos (Berkeley, CA)")
- **Date**: (e.g., "2025-01-15")
- **Type**: (Text, Image, Sound, MovingImage, Dataset)
- **Format**: (e.g., "Digital journal entries")
- **Subject**: (Add each subject as separate entry)
- **Coverage**: (Geographic location)
- **Rights**: (Permission/usage information)

#### Custom Fields (if your Omeka site supports them):
- **Contributor Tags**: non-traditional, accessible, culturally-informed
- **Health Focus**: Mental wellness and physical mobility
- **Community Context**: (relevant community information)

### 4. Item Types in Your Archive:
1. **Text Items** (3 items): Journal entries, recipes, documentation
2. **Image Items** (2 items): Photo documentation of communities and practices
3. **Sound Items** (2 items): Audio journals and guided meditations
4. **Moving Image Items** (2 items): Video interviews and cooking sessions
5. **Data Set Items** (1 item): Health metrics and transit mapping

### 5. Tags to Use
Based on your project themes:
- `community-health`
- `traditional-knowledge`
- `accessibility`
- `intergenerational`
- `worker-focused`
- `cultural-knowledge`
- `stress-management`
- `nutrition`
- `adaptive-fitness`

### 6. After Adding Items
1. Make items **public** so they appear on your site
2. Note the item IDs or URLs for integration
3. Test the public site at: https://bluezonesnow.omeka.net

## Integration with Your Current Website

Once you've added items to Omeka, you can:

1. **Link directly** to your Omeka items from the current website
2. **Display Omeka items** using the API (if Omeka.net supports it)
3. **Reference your archive** in the About page (already updated)
4. **Demonstrate metadata crosswalk** between your site and Omeka

## Example Item Entry

**Title**: Maria's Morning Routine Documentation  
**Description**: Daily morning ritual combining meditation, gentle stretching, and herbal tea preparation documented over 3 months  
**Creator**: Maria Santos (Berkeley, CA)  
**Date**: 2025-01-15  
**Type**: Text  
**Subject**: wellness routines; meditation; herbal medicine; daily practices  
**Coverage**: Berkeley, California  
**Rights**: Shared with permission for community archive  

This demonstrates community-controlled metadata and participatory archiving principles from your coursework!
