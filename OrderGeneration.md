📊 Order Generation by Difficulty Mode
🟢 Easy Mode
Order Generation Rate: Low (0.002 probability per second)
Dynamic Orders: ~7 orders per hour during gameplay
Initial Pending Orders: 3-6 orders at game start
Scheduled Orders: 8 total orders released over 15 minutes
Session Duration: 15 minutes
Game Speed: 1x (normal speed)
🟡 Medium Mode
Order Generation Rate: Medium (0.006 probability per second)
Dynamic Orders: ~22 orders per hour during gameplay
Initial Pending Orders: 5-10 orders at game start
Scheduled Orders: 18 total orders released over 30 minutes (increased for more FIFO decisions)
Session Duration: 30 minutes
Game Speed: 1x (normal speed)
🔴 Hard Mode
Order Generation Rate: High (0.009 probability per second)
Dynamic Orders: ~32 orders per hour during gameplay
Initial Pending Orders: 8-15 orders at game start
Scheduled Orders: 24 total orders released over 60 minutes (increased for challenging priority management)
Session Duration: 60 minutes
Game Speed: 2x (double speed = effectively 64 orders per hour)
📈 Total Order Volume Estimates
Easy (15 min session):

Initial: 3-6 orders
Scheduled: 8 orders
Dynamic: ~1-2 orders
Total: ~12-16 orders
Medium (30 min session):

Initial: 5-10 orders
Scheduled: 18 orders (increased)
Dynamic: ~11 orders (increased)
Total: ~34-39 orders
Hard (60 min session @ 2x speed):

Initial: 8-15 orders
Scheduled: 24 orders (increased)
Dynamic: ~64 orders (due to 2x speed and increased rate)
Total: ~96-103 orders
⚙️ Technical Details
Generation Logic: Uses probability check every simulation step (1 second intervals)
Order Timing: First 3 scheduled orders appear within 2 minutes, rest spread evenly
Complexity Scaling: Route complexity and order difficulty increase with each mode
Educational Design: Progressive difficulty helps students learn manufacturing concepts step-by-step
The system is designed to provide appropriate challenge levels while maintaining educational value! 🎯
