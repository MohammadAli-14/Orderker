from PIL import Image, ImageDraw
import os

# Configuration
ASSET_DIR = r"e:\OrderKerEcommerceProject - Copy\expo-ecommerce\mobile\assets\images"
BG_COLOR = "#121212"  # Dark Charcoal
ACCENT_COLOR = "#1DB954"  # Spotify Green
TRANSPARENT = (0, 0, 0, 0)

# Ensure directory exists
os.makedirs(ASSET_DIR, exist_ok=True)

def draw_circle_logo(draw, size, color):
    # Center and Radius
    cx, cy = size / 2, size / 2
    r_outer = size * 0.4
    r_inner = size * 0.25
    center_offset = size * 0.05
    
    # Draw Thick Circle (The 'O')
    # Outer circle
    draw.ellipse(
        [(cx - r_outer, cy - r_outer), (cx + r_outer, cy + r_outer)],
        fill=color
    )
    # Inner circle (to make it a ring) - using composite/masking is better but simple overwrite works for solid bg
    # For transparent bg, we need to be careful. 
    # Better approach: Draw a stroke circle? 
    # PIL doesn't do thick strokes well on ellipses without jagged edges unless high res.
    # Let's simple draw a circle.
    
    # Let's draw a "Bag" handle + Rectangle body?
    # Simple is better: A stylized "O" (Ring) 
    # To handle transparency properly for the hole, we should draw on a mask or use stroke.
    # Since we want a "Fine Tailored" look, let's do a solid circle with an "OK" checkmark or just a minimal 'O'.
    
    # Let's do a solid circle with a white/dark checkmark inside? 
    # Or just a clean Ring. A Ring is safest and looks premium.
    
    width = size * 0.12
    bbox = [(cx - r_outer, cy - r_outer), (cx + r_outer, cy + r_outer)]
    
    # Draw arc/ring
    # Since arc is jagged, let's draw two circles.
    # This works for solid background (draw outer color, then inner background color).
    # For transparent background, this is tricky as the inner circle needs to be transparent.
    # We will just draw a filled circle for now to keep it simple and robust, 
    # maybe add a small dot in the center to make it look like a target/record.
    
    # Outer Circle
    draw.ellipse(bbox, fill=color)
    
    # Inner "Hole" - logic dependent on background
    # If we are expecting transparency, we can't easily "erase" with a color in standard draw mode 
    # without alpha compositing.
    # But for a simple logo, a solid filled circle is also huge.
    # Let's stick to a Solid Circle (Dot) for the Foreground. It's iconic.
    # Like a "Record" or "Spot".
    
    # Actually, let's try to simulate a Ring by limiting the draw.
    # Or just draw a Hexagon? 
    # Let's draw a Rounded Square (Bag shape) for Ecommerce?
    
    # Let's go with a Minimalist Shopping Bag.
    # Bag Body
    bag_w = size * 0.5
    bag_h = size * 0.5
    bag_x = (size - bag_w) / 2
    bag_y = (size - bag_h) / 2 + (size * 0.05)
    
    draw.rounded_rectangle(
        [(bag_x, bag_y), (bag_x + bag_w, bag_y + bag_h)],
        radius=size*0.05,
        fill=color
    )
    
    # Bag Handle
    handle_w = bag_w * 0.5
    handle_h = bag_h * 0.3
    handle_x = (size - handle_w) / 2
    handle_y = bag_y - (handle_h * 0.6)
    
    draw.ellipse(
        [(handle_x, handle_y), (handle_x + handle_w, handle_y + handle_h)],
        outline=color,
        width=int(size * 0.04)
    )
    # This handles the handle top. 
    # We need to mask the bottom of handle? 
    # Actually, drawing the handle *behind* the bag is hard with single layer.
    
    # Alternative: Just the Letter "O" with a dot.
    pass

def create_image(filename, size, bg_color, fg_color, is_transparent_bg=False):
    mode = 'RGBA'
    if is_transparent_bg:
        img = Image.new(mode, (size, size), TRANSPARENT)
    else:
        img = Image.new(mode, (size, size), bg_color)
    
    draw = ImageDraw.Draw(img)
    
    # Design: Modern "O" Ring
    cx, cy = size / 2, size / 2
    r_outer = size * 0.35
    thickness = size * 0.12
    
    # Draw Ring
    # To handle the "hole" transparency, we use a temporary image to draw the ring
    # Layer 1: The Ring Color
    
    # Simple approach for PIL:
    # 1. Draw large circle (Fg color)
    # 2. Draw smaller circle (Bg color - wait, if Transparent BG, this must be Transparent)
    
    # If Transparent BG:
    # We can use `im.putalpha()` based on a mask, or use `pieslice`.
    # A simple way for a ring with transparent hole:
    # Draw outer circle on a transparent layer.
    # Create a mask for the inner circle.
    # Paste/Composite.
    
    # Let's stick to a solid filled shape to avoid artifacts if we aren't careful.
    # A Hexagon or a Solid Circle is great.
    # Let's do a Solid RoundRect with an "O" inside?
    
    # Let's do a CLEAN SHOPPING BAG Outline.
    
    # Draw Bag Body (Rounded Rect)
    bag_w = size * 0.55
    bag_h = size * 0.5
    bx0 = (size - bag_w) / 2
    by0 = (size - bag_h) / 2 + (size * 0.08)
    bx1 = bx0 + bag_w
    by1 = by0 + bag_h
    
    # Handle (Arch)
    handle_r = bag_w * 0.5
    hx0 = cx - (handle_r / 2)
    hy0 = by0 - (handle_r / 2)
    hx1 = cx + (handle_r / 2)
    hy1 = by0 + (handle_r / 2)
    
    # Draw Handle (Arc) - Stroke
    draw.arc([hx0, hy0, hx1, hy1], start=180, end=0, fill=fg_color, width=int(size * 0.06))
    
    # Draw Bag Body
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=size*0.1, fill=fg_color)
    
    # Draw Checkmark/Tick inside (using BG color or Transparent) to imply "Order Kept/Done"
    # If BG is transparent, we need to erase. 
    # "Erasing" in PIL: draw with (0,0,0,0) and use composition mode, or mask.
    # Simple hack: If transparent_bg, we can't easily click "erase" with standard draw.
    
    # Let's just draw the "Checkmark" in the BG color if it's solid.
    # If transparent, we might just leave it solid green bag.
    
    # Actually, for the transparent icon, a Solid Green Bag is perfect.
    # For the Main Icon (Dark BG), a Solid Green Bag on Dark BG is perfect.
    
    # Add a checkmark cutout?
    # Let's simulate cutout by drawing the checkmark in the BG color (if solid).
    if not is_transparent_bg:
        # Draw checkmark in BG_COLOR
        chk_w = bag_w * 0.4
        chk_xm = cx
        chk_ym = by0 + (bag_h * 0.55)
        
        # Points for check
        p1 = (chk_xm - chk_w*0.5, chk_ym)
        p2 = (chk_xm - chk_w*0.1, chk_ym + chk_w*0.4)
        p3 = (chk_xm + chk_w*0.6, chk_ym - chk_w*0.6)
        
        draw.line([p1, p2, p3], fill=bg_color, width=int(size * 0.06), joint="curve")
    else:
        # For transparent FG icon, if we want the cutout, we'd need alpha ops.
        # For simplicity, let's draw the Checkmark in DARK color (e.g. #121212) 
        # So it looks like a cutout against the green bag, 
        # even if it's technically dark grey pixels.
        # On a dark phone background, it will blend. 
        # On a light background, it will checkmark.
        
        chk_w = bag_w * 0.4
        chk_xm = cx
        chk_ym = by0 + (bag_h * 0.55)
        p1 = (chk_xm - chk_w*0.5, chk_ym)
        p2 = (chk_xm - chk_w*0.1, chk_ym + chk_w*0.4)
        p3 = (chk_xm + chk_w*0.6, chk_ym - chk_w*0.6)
        
        # Use a very dark color or white?
        # Adaptive icons usually sit on a background. 
        # If foreground is transparent, user sees wallpaper or folder.
        # Let's stick to Dark Grey checkmark inside the green bag.
        draw.line([p1, p2, p3], fill=BG_COLOR, width=int(size * 0.06), joint="curve")

    # Save
    filepath = os.path.join(ASSET_DIR, filename)
    img.save(filepath)
    print(f"Generated {filepath}")

# 1. Main Icon (1024x1024)
create_image("icon.png", 1024, BG_COLOR, ACCENT_COLOR, is_transparent_bg=False)

# 2. Splash Icon (1024x1024) - Reuse Main or Transparent
# Usually just the logo on transparent or match splash config.
# Config says splash-icon.png. Let's start with transparent version.
create_image("splash-icon.png", 1024, BG_COLOR, ACCENT_COLOR, is_transparent_bg=True)

# 3. Android Foreground (1024x1024 - resize handled by Expo but good to match)
create_image("android-icon-foreground.png", 1024, BG_COLOR, ACCENT_COLOR, is_transparent_bg=True)

# 4. Android Background (1024x1024)
# Solid Color
create_image("android-icon-background.png", 1024, BG_COLOR, BG_COLOR, is_transparent_bg=False)

# 5. Android Monochrome
# White on Transparent
create_image("android-icon-monochrome.png", 1024, BG_COLOR, "#FFFFFF", is_transparent_bg=True)

# 6. Favicon (Resize down)
# 48x48
create_image("favicon.png", 48, BG_COLOR, ACCENT_COLOR, is_transparent_bg=True)
