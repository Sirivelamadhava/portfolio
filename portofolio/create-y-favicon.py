#!/usr/bin/env python3
"""
Create favicon with letter Y
Requires PIL/Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    # Create 32x32 favicon
    img = Image.new('RGB', (32, 32), color='#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    # Try to use a bold font
    try:
        # Try different font paths
        font_paths = [
            'C:/Windows/Fonts/arialbd.ttf',  # Windows
            'C:/Windows/Fonts/arial.ttf',
            '/System/Library/Fonts/Helvetica.ttc',  # macOS
            '/usr/share/fonts/truetype/arial.ttf',  # Linux
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                try:
                    font = ImageFont.truetype(path, 24)
                    break
                except:
                    continue
        if not font:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Draw Y
    draw.text((16, 16), 'Y', fill='#ff922b', font=font, anchor='mm')
    img.save('assets/img/favicon.png')
    print('✓ Created favicon.png')
    
    # Create 180x180 apple touch icon
    img_large = Image.new('RGB', (180, 180), color='#0a0a0a')
    draw_large = ImageDraw.Draw(img_large)
    
    try:
        font_large = None
        for path in font_paths:
            if os.path.exists(path):
                try:
                    font_large = ImageFont.truetype(path, 140)
                    break
                except:
                    continue
        if not font_large:
            font_large = ImageFont.load_default()
    except:
        font_large = ImageFont.load_default()
    
    # Draw Y
    draw_large.text((90, 90), 'Y', fill='#ff922b', font=font_large, anchor='mm')
    img_large.save('assets/img/apple-touch-icon.png')
    print('✓ Created apple-touch-icon.png')
    
except ImportError:
    print("PIL/Pillow not installed. Install with: pip install Pillow")
    print("Or use generate-favicon.html in a browser to create the PNG files")
except Exception as e:
    print(f"Error: {e}")
    print("Use generate-favicon.html in a browser to create the PNG files")

