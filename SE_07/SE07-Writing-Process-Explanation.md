# Writing Process Explanation - Travel Expense Tracker Documentation
**SE_07 Module - Technical Documentation**  
Seif  
November 2025

## Introduction

For the Travel Expense Tracker project, I created comprehensive technical documentation spanning multiple files and formats. This explanation outlines my approach to documentation, including audience identification, purpose definition, format selection, and the writing process I followed.

## Documentation Created

I produced the following documentation artifacts:
1. **Main README.md** - Project overview and setup guide
2. **backend/README.md** - API endpoint documentation
3. **frontend/README.md** - Component architecture documentation
4. **CONTRIBUTING.md**  - Contributor guidelines and development workflow
5. **CLEAN_CODE.md**  - Clean code principles with code examples
6. **Swagger UI** - Interactive API documentation
7. **Entity-Relationship Diagram** - Database schema visualization
8. **Architecture Diagram** - System architecture overview
9. **Code Comments** - Strategic inline documentation (Most files)

## Audience Identification

I identified three primary audience groups, each requiring different documentation approaches:

### 1. End Users / New Users
- **Audience:** Developers or users wanting to quickly understand and run the project
- **Documentation:** Main README.md, installation guide, screenshots
- **Approach:** Clear, concise language with step-by-step instructions and visual aids

### 2. Contributing Developers
- **Audience:** Developers who want to contribute code or understand the codebase
- **Documentation:** CONTRIBUTING.md, CLEAN_CODE.md, code comments, architecture diagrams
- **Approach:** Technical depth with code examples, best practices, and architectural decisions

### 3. API Consumers / Frontend Developers
- **Audience:** Developers integrating with the backend API
- **Documentation:** Swagger UI, backend README, endpoint examples
- **Approach:** Interactive documentation with request/response examples and authentication details

## Purpose of Each Documentation Type

### Main README.md
The main README serves as the entry point for anyone encountering the project. Its purpose is to quickly communicate what the project does, how to set it up, and where to find more information. I structured it with clear sections (Features, Tech Stack, Installation, Usage) to help readers find relevant information quickly.

### Swagger API Documentation
Swagger provides interactive, executable documentation for the REST API. Its purpose is to let developers explore endpoints, understand request/response formats, and test the API directly from the browser. I chose Swagger because it auto-generates from code annotations, ensuring documentation stays synchronized with implementation.

### CONTRIBUTING.md
This guide's purpose is to lower the barrier for new contributors by explaining the development workflow, coding standards, and how to submit changes. It covers everything from setting up the development environment to running tests and making pull requests.

### CLEAN_CODE.md
This document serves a dual purpose: demonstrating my understanding of clean code principles for SE_08 assessment, and providing a reference for contributors on the coding standards used in the project. It links principles to actual code examples from the codebase.

### ER Diagram and Architecture Diagram
These visual documents communicate complex relationships and system structure more effectively than text. The ER diagram shows database relationships at a glance, while the architecture diagram explains how frontend, backend, and database interact.

### Code Comments
Strategic inline comments explain the "why" behind complex logic, particularly for date validation, authentication middleware, and business rules. I avoided commenting obvious code, focusing only on non-obvious decisions or complex algorithms.

## Format Selection Rationale

### Markdown for Text Documentation
I chose Markdown for all text-based documentation because it's:
- Version-controllable (lives alongside code in Git)
- Readable both as plain text and rendered
- Widely supported (GitHub, GitLab, documentation sites)
- Simple to write and maintain

### Swagger/OpenAPI for API Documentation
I selected Swagger because it:
- Auto-generates from JSDoc annotations in code
- Provides interactive testing interface
- Stays synchronized with actual implementation
- Is an industry standard for REST APIs

### Diagrams (PNG images)
I created diagrams as image files because they:
- Can be embedded directly in Markdown
- Are viewable without special tools
- Communicate complex relationships visually
- Can be version-controlled

## Writing Process

### 1. Planning Phase
Before writing documentation, I created an outline identifying what needed to be documented and for whom. I sketched the main README structure, listed API endpoints for Swagger documentation, and identified which code sections needed comments. I kept these notes in a simple text file as I developed.

### 2. Iterative Drafting
I wrote documentation iteratively alongside code development, not as a final step. When I created a new API endpoint, I immediately added Swagger annotations. When I completed a feature, I updated the README. This approach prevented documentation from becoming outdated and reduced the burden of writing everything at once.

### 3. Refinement
After completing initial drafts, I reviewed documentation from each audience perspective:
- For the README, I followed my own installation instructions on a fresh system to verify accuracy
- For API documentation, I tested each Swagger endpoint to ensure examples worked
- For CONTRIBUTING.md, I considered what information I would want when contributing to someone else's project

### 4. Version Control Evidence
My Git commit history shows the iterative documentation process:
- Early commits include basic README structure
- Mid-development commits show API documentation updates alongside feature additions
- Later commits show refinements to CONTRIBUTING.md and CLEAN_CODE.md
- Comments were added in the same commits as the code they explain

## Feedback Incorporation

Throughout development, I sought feedback informally by:
- Testing installation instructions on different environments
- Having classmates review the README clarity
- Using the Swagger UI myself as if I were a new API consumer
- Reading my own documentation after time away from the project to identify confusing sections

This iterative feedback loop helped me identify areas where documentation assumed too much knowledge or lacked necessary detail.

## Conclusion

My documentation approach balanced comprehensiveness with maintainability by writing documentation iteratively, choosing formats that stay synchronized with code, and targeting specific audiences with appropriate levels of detail. The result is a well-documented project that lowers barriers for users, contributors, and API consumers while remaining accurate and up-to-date.

---