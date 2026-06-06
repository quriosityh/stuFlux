# Chapter 7 — Results, Discussion and Conclusion

## 7.1 Overview

This chapter evaluates the outcomes of the StuFlux development and validation phase against the objectives defined in Chapter 1. It covers functional completeness, performance, a competitive comparison, known limitations, and the path forward.

## 7.2 Functional Completeness

All high-priority features were successfully delivered in the MVP.

| Feature | Status |
| :--- | :--- |
| User registration and login (email + Google OAuth) | ✅ Complete |
| Profile creation and editing | ✅ Complete |
| Multi-step listing creation with photo upload | ✅ Complete |
| Category-based browsing and search | ✅ Complete |
| Availability calendar with conflict detection | ✅ Complete |
| Request-based booking workflow (pending → confirmed/rejected) | ✅ Complete |
| Real-time messaging (SSE-based) | ✅ Complete |
| Bidirectional review system with blind reveal | ✅ Complete |
| In-app notifications for status changes | ✅ Complete |

Medium and low priority features (wishlist, advanced location filters, social sharing) were deferred as planned.

## 7.3 Performance Metrics

Performance was measured under simulated load targeting key API endpoints over a two-week validation window.

| Metric | Target | Achieved |
| :--- | :--- | :--- |
| Page load time (3G/4G) | < 300ms LCP | ~210ms avg |
| API response — reads | < 200ms | ~120ms avg |
| API response — writes | < 500ms | ~280ms avg |
| Database query time | < 100ms | ~60ms avg |
| Concurrent user support | 10+ | 10 simulated (stable) |
| Uptime (Vercel + Railway) | 99% | 99.3% observed |

## 7.4 Discussion

**Technical performance.** The hybrid Next.js + Express.js architecture performed as expected. Server Components handled the read-heavy workload through Next.js caching, keeping load times well under target. Write operations through Express.js maintained transactional integrity with no data loss observed. PostgreSQL RLS policies were verified correct — users could only access their own bookings and messages.

**Trust mechanism.** The review system uses a blind-reveal pattern: neither party can read the other's review until both have submitted (or a 14-day window lapses). This prevents retaliatory or mimicked feedback, ensuring each review is written independently. It functions like a sealed ballot — both votes are committed before either is shown. This aligns with the approach used by Airbnb and Fat Llama [8].

**Usability.** Core rental tasks (browse → book → message) were completable within 3 clicks on desktop and 4 on mobile across tested screen sizes (320px–1440px).

## 7.5 Comparison with Existing Solutions

| Feature | GetGaari / GariConnect | RentHives | StuFlux |
| :--- | :--- | :--- | :--- |
| Multi-category listings | ❌ (vehicles only) | ❌ (fashion only) | ✅ (6 categories) |
| Real-time messaging | ❌ | ❌ | ✅ |
| Bidirectional review system | ❌ | ❌ | ✅ |
| Calendar-based availability | ❌ | Limited | ✅ |
| Mobile-responsive web app | Partial | Partial | ✅ |
| Request-based booking workflow | ❌ | ❌ | ✅ |
| Online payment gateway | ❌ | ❌ | ❌ (planned) |

StuFlux is the only platform in the Pakistani market to combine multi-category listings, real-time communication, and a structured trust mechanism in one web-based product.

## 7.6 Limitations and Challenges

| Issue | Status / Resolution |
| :--- | :--- |
| No payment gateway (Stripe/PayPal restricted in Pakistan) | Cash flow designed; JazzCash/EasyPaisa integration path documented for future |
| SSE connections timing out on Vercel serverless | Polling fallback implemented after connection loss |
| City-level filtering only; no map/GPS | Deferred to Phase 2 |
| Performance metrics based on simulated load, not real traffic | Acknowledged; real-world validation planned post-launch |
| Cloudinary large file uploads failing silently | Client-side file size and type validation added before upload |

## 7.7 Future Work

**Phase 2 (Months 7–12):** React Native mobile apps; JazzCash / EasyPaisa payment integration; phone/CNIC identity verification; push notifications.

**Phase 3 (Year 2):** AI-powered listing recommendations; dynamic pricing suggestions; microinsurance partnerships for high-value items; admin dispute resolution dashboard.

**Phase 4 (Year 3+):** Expansion to Karachi and Islamabad; hierarchical subcategories; open public API; tiered verified-badge program.

## 7.8 Conclusion

StuFlux demonstrates that a well-designed digital marketplace can address the trust and fragmentation problems that characterize informal rental markets in Pakistan. All MVP functional requirements were met, performance targets were achieved, and the platform outperforms existing Pakistani P2P rental services across every measured dimension except payment integration.

The technical architecture is modular and built for growth, able to absorb new features without major restructuring. The project also contributes academically by documenting the specific challenges of building P2P platforms for markets with limited payment infrastructure and low baseline digital trust — insights applicable to similar emerging markets across South Asia.

*BSCSF22 | Government Queen Mary Graduate College, University of the Punjab, Lahore*
*Team ID: 08 | Session: Fall 2022*
*Submitted by: Hajra Mubasher (93080) & Wajeeha Shahzeb (93078)*
*Supervisor: Miss Rida, Lecturer*
