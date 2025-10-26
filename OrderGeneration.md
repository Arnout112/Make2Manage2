# Make2Manage - Order Generation & Game Logic Documentation

## 📊 Order Generation by Difficulty Mode

### 🟢 Easy Mode

- **Order Generation Rate**: Low (0.002 probability per second)
- **Dynamic Orders**: ~7 orders per hour during gameplay
- **Initial Pending Orders**: 3-6 orders at game start
- **Scheduled Orders**: 8 total orders released over 15 minutes
- **Session Duration**: 15 minutes
- **Game Speed**: 1x (normal speed)
- **Educational Focus**: Basic concepts with guided assistance

### 🟡 Medium Mode

- **Order Generation Rate**: Medium (0.006 probability per second)
- **Dynamic Orders**: ~22 orders per hour during gameplay
- **Initial Pending Orders**: 5-10 orders at game start
- **Scheduled Orders**: 18 total orders released over 30 minutes (increased for more FIFO decisions)
- **Session Duration**: 30 minutes
- **Game Speed**: 1x (normal speed)
- **Educational Focus**: Moderate complexity with priority rule practice

### 🔴 Hard Mode

- **Order Generation Rate**: High (0.009 probability per second)
- **Dynamic Orders**: ~32 orders per hour during gameplay
- **Initial Pending Orders**: 8-15 orders at game start
- **Scheduled Orders**: 24 total orders released over 60 minutes (increased for challenging priority management)
- **Session Duration**: 60 minutes
- **Game Speed**: 2x (double speed = effectively 64 orders per hour)
- **Educational Focus**: Advanced manufacturing scenarios with complex decision making

## 📈 Total Order Volume Estimates

### Easy (15 min session):

- **Initial**: 3-6 orders
- **Scheduled**: 8 orders
- **Dynamic**: ~1-2 orders
- **Total**: ~12-16 orders

### Medium (30 min session):

- **Initial**: 5-10 orders
- **Scheduled**: 18 orders (increased)
- **Dynamic**: ~11 orders (increased)
- **Total**: ~34-39 orders

### Hard (60 min session @ 2x speed):

- **Initial**: 8-15 orders
- **Scheduled**: 24 orders (increased)
- **Dynamic**: ~64 orders (due to 2x speed and increased rate)
- **Total**: ~96-103 orders

## 🎯 New Game Logic Features

### 🎨 Visual Order Tracking System

- **Order Color Coding**: Each order gets a unique, consistent color throughout the workflow
- **Design**: Subtle colored top borders (4px for cards, 3px for queue items)
- **12-Color Palette**: Red, blue, green, yellow, purple, pink, indigo, teal, orange, cyan, lime, emerald
- **Hash-Based Assignment**: Same order ID always gets same color for consistency
- **Educational Value**: Students can visually track orders through manufacturing departments

### 🏷️ Priority Color System

- **Urgent Priority**: Red text (`text-red-600`) - Immediate attention required
- **High Priority**: Orange text (`text-orange-600`) - Elevated processing priority
- **Normal Priority**: Green text (`text-green-600`) - Standard processing
- **Low Priority**: Green text (`text-green-600`) - Lower priority processing
- **Consistent Display**: All priority text uses `getPriorityLabel()` for uppercase formatting

### 📋 Enhanced Order Management

- **Tabbed Interface**: Separate tabs for Pending and Completed orders
- **Pending Orders**: Drag-and-drop assignment, priority badges, route progress
- **Completed Orders**: Performance tracking, lead time display, completion status
- **Color Coordination**: Same order maintains color from pending through completion

### 🏭 Department Processing Improvements

- **Manual Processing Controls**: Start/Complete processing buttons for educational control
- **Timer Validation**: Students must wait for processing timers to complete
- **Progress Indicators**: Visual progress bars showing processing completion
- **Queue Management**: Color-coded queue items with priority display
- **Educational Feedback**: Clear instructions and status updates

### 📊 Route Progress Tracking

- **Fixed Completion Bug**: Now correctly shows only completed steps (timestamps with end dates)
- **Visual Indicators**: Green checkmarks for completed, blue for current, gray for pending
- **Department Labels**: Optional department name labels for clarity
- **Size Variants**: Small (sm), medium (md), and large (lg) for different contexts

## ⚙️ Technical Implementation Details

### Order Generation Logic

- **Timing**: Uses probability check every simulation step (1 second intervals)
- **Scheduled Release**: First 3 orders appear within 2 minutes, rest spread evenly
- **Complexity Scaling**: Route length and difficulty increase with game mode
- **Random Seeding**: Consistent gameplay with reproducible scenarios

### Manual Mode Features

- **Student Control**: Students manually start and complete processing
- **Educational Validation**: Timer requirements teach realistic processing times
- **Decision Points**: Multiple opportunities for priority rule application
- **Feedback System**: Clear instructions and status updates for learning

### Color System Architecture

```typescript
// Consistent color assignment
getOrderColor(orderId: string) // Returns same color for same ID
getPriorityTextColor(priority) // Returns appropriate priority color
getPriorityLabel(priority) // Returns formatted uppercase label
```

### Processing State Management

- **Timestamps**: Track start/end times for accurate progress calculation
- **Manual Completion**: Students control when processing finishes
- **Route Progression**: Orders automatically move through predefined routes
- **Status Tracking**: Real-time updates of order status and location

## 🎓 Educational Design Philosophy

### Progressive Difficulty

- **Easy**: Focus on basic workflow understanding
- **Medium**: Practice priority rules and FIFO decisions with increased volume
- **Hard**: Master complex manufacturing scenarios with high order flow

### Learning Objectives

1. **Order Flow Understanding**: Visual tracking through manufacturing workflow
2. **Priority Management**: Color-coded priority system for decision practice
3. **FIFO Rule Application**: Increased order volume forces priority decisions
4. **Process Control**: Manual processing teaches timing and validation
5. **Performance Analysis**: Completed orders tab enables learning from results

### Visual Learning Enhancement

- **Consistent Colors**: Same order maintains visual identity throughout process
- **Priority Coding**: Immediate visual priority identification
- **Progress Tracking**: Clear indication of completion status
- **Professional Interface**: Clean design suitable for educational environments

## 🚀 Performance Impact

### Order Volume Increases

- **Medium Mode**: 55% increase in total orders (22-28 → 34-39)
- **Hard Mode**: 130% increase in total orders (42-67 → 96-103)
- **Educational Benefit**: More decision-making opportunities per session
- **FIFO Practice**: Sufficient volume to require priority rule thinking

### System Optimization

- **Efficient Rendering**: Color assignment using hash functions for performance
- **Memory Management**: Completed orders limited to last 24 for display
- **Update Frequency**: 1-second simulation steps for smooth gameplay
- **Responsive Design**: Scales from individual cards to full department views

The enhanced Make2Manage system now provides a comprehensive educational experience for learning make-to-order manufacturing concepts with increased order flow, better visual tracking, and improved decision-making opportunities! 🎯
