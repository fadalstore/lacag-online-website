
// Revenue Tracking System
class RevenueTracker {
    constructor() {
        this.dailyRevenue = 0;
        this.monthlyRevenue = 0;
        this.adClicks = 0;
    }
    
    trackAdClick(adType, revenue = 0.10) {
        this.adClicks++;
        this.dailyRevenue += revenue;
        this.monthlyRevenue += revenue;
        
        // Save to localStorage
        localStorage.setItem('adRevenue', JSON.stringify({
            daily: this.dailyRevenue,
            monthly: this.monthlyRevenue,
            clicks: this.adClicks,
            lastUpdate: new Date()
        }));
        
        console.log(`Ad clicked! Revenue: $${revenue}`);
    }
    
    getStats() {
        return {
            daily: this.dailyRevenue.toFixed(2),
            monthly: this.monthlyRevenue.toFixed(2),
            clicks: this.adClicks
        };
    }
}

// Initialize tracker
const revenueTracker = new RevenueTracker();

// Track all ad clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.ad-banner') || e.target.closest('.ad-rectangle')) {
        revenueTracker.trackAdClick('banner', Math.random() * 0.50 + 0.05);
    }
});
