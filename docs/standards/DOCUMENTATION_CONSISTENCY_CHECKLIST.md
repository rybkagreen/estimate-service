# Documentation Consistency Checklist

> **Version:** 1.0  
> **Last Updated:** 06.07.2025  
> **Purpose:** Ensure all documentation follows consistent standards and
> practices

## Pre-Documentation Checklist

### 1. Document Metadata ✅

- [ ] Document title is clear and descriptive
- [ ] Version number included
- [ ] Last updated date specified
- [ ] Status indicated (Draft/Review/Published/Deprecated)
- [ ] Author(s) listed
- [ ] Target audience identified

### 2. Structure & Organization ✅

- [ ] Table of contents for documents >500 words
- [ ] Logical section hierarchy (H1 → H2 → H3)
- [ ] Consistent heading capitalization
- [ ] Introduction/overview section present
- [ ] Conclusion/summary section included

## Content Consistency Checklist

### 3. Terminology & Language ✅

- [ ] Terms match the [Terminology Glossary](./TERMINOLOGY_GLOSSARY.md)
- [ ] Consistent use of Russian/English based on audience
- [ ] Acronyms spelled out on first use
- [ ] Technical jargon explained or linked
- [ ] Active voice used primarily
- [ ] Present tense for current features

### 4. Code Examples ✅

- [ ] Language specified for all code blocks
- [ ] Syntax highlighting applied
- [ ] Comments explain complex logic
- [ ] Import statements included where needed
- [ ] Error handling demonstrated
- [ ] Real-world examples provided

### 5. Visual Elements ✅

- [ ] Diagrams use consistent style (Mermaid preferred)
- [ ] Screenshots are current and annotated
- [ ] Images have alt text for accessibility
- [ ] Tables have headers and proper formatting
- [ ] Icons/emojis used consistently
- [ ] Color coding follows design system

## Technical Accuracy Checklist

### 6. API Documentation ✅

- [ ] Endpoints match current implementation
- [ ] Request/response examples are valid JSON
- [ ] Authentication requirements specified
- [ ] Error codes and messages documented
- [ ] Rate limits mentioned
- [ ] Versioning information included

### 7. Code Snippets ✅

- [ ] Code is syntactically correct
- [ ] Dependencies and versions specified
- [ ] Environment setup explained
- [ ] Expected output shown
- [ ] Common errors addressed
- [ ] Best practices demonstrated

### 8. Configuration Examples ✅

- [ ] Environment variables documented
- [ ] Default values provided
- [ ] Required vs optional clearly marked
- [ ] Security implications noted
- [ ] Example .env file included
- [ ] Platform-specific notes added

## Style & Formatting Checklist

### 9. Markdown Standards ✅

- [ ] Proper spacing around headers
- [ ] Blank lines between sections
- [ ] Lists properly indented
- [ ] Links use descriptive text
- [ ] No broken internal links
- [ ] External links open in new tab (where applicable)

### 10. Naming Conventions ✅

- [ ] Files use UPPER_SNAKE_CASE for main docs
- [ ] Folders use kebab-case
- [ ] Anchors use lowercase with hyphens
- [ ] Code variables follow language conventions
- [ ] Database fields use snake_case
- [ ] API endpoints use kebab-case

## Review & Quality Checklist

### 11. Peer Review ✅

- [ ] Technical accuracy verified by SME
- [ ] Grammar and spelling checked
- [ ] Clarity reviewed by target audience member
- [ ] Examples tested and working
- [ ] Links validated
- [ ] Cross-references verified

### 12. Accessibility ✅

- [ ] Headings used for structure (not just style)
- [ ] Lists used appropriately
- [ ] Tables include headers
- [ ] Color not sole indicator of meaning
- [ ] Abbreviations explained
- [ ] Language is clear and simple

### 13. Maintenance ✅

- [ ] Changelog section included
- [ ] Review date scheduled
- [ ] Owner/maintainer assigned
- [ ] Update triggers defined
- [ ] Archive strategy determined
- [ ] Related docs cross-linked

## Documentation Type-Specific Checklists

### For User Guides ✅

- [ ] Step-by-step instructions with screenshots
- [ ] Prerequisites clearly stated
- [ ] Common use cases covered
- [ ] Troubleshooting section included
- [ ] FAQ addresses common questions
- [ ] Support contact information provided

### For API Documentation ✅

- [ ] OpenAPI/Swagger spec updated
- [ ] Authentication examples provided
- [ ] Rate limiting explained
- [ ] Versioning strategy documented
- [ ] SDK examples included (if applicable)
- [ ] Webhook events documented (if applicable)

### For Architecture Documents ✅

- [ ] System context diagram included
- [ ] Component interactions shown
- [ ] Technology choices justified
- [ ] Scalability considerations addressed
- [ ] Security model explained
- [ ] Deployment architecture illustrated

### For Development Guides ✅

- [ ] Setup instructions complete
- [ ] Development workflow explained
- [ ] Coding standards referenced
- [ ] Testing approach documented
- [ ] Debugging tips included
- [ ] Common pitfalls highlighted

## Post-Documentation Checklist

### 14. Publishing ✅

- [ ] Document added to appropriate folder
- [ ] Index/README updated with new doc
- [ ] Search tags added (if applicable)
- [ ] Notification sent to relevant teams
- [ ] Old versions archived properly
- [ ] Redirects set up for moved content

### 15. Tracking & Analytics ✅

- [ ] Document added to tracking system
- [ ] Analytics tags included
- [ ] Feedback mechanism enabled
- [ ] Review reminder scheduled
- [ ] Success metrics defined
- [ ] Update frequency determined

## Quick Reference Card

### Essential Elements Every Document Needs:

```markdown
# Document Title

> **Version:** X.Y  
> **Last Updated:** YYYY-MM-DD  
> **Status:** Active  
> **Audience:** [Target Audience]

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content...

## Section 2

Content...

---

**Related Documents:**

- [Link 1](url)
- [Link 2](url)
```

### Common Issues to Avoid:

❌ **Don't:**

- Mix languages without context
- Use inconsistent terminology
- Include outdated screenshots
- Write walls of text without breaks
- Assume prior knowledge
- Skip error handling in examples

✅ **Do:**

- Define terms on first use
- Include visual aids
- Provide complete examples
- Test all code snippets
- Consider multiple audiences
- Update regularly

## Reviewer Sign-off

| Check               | Reviewer   | Date   | Notes  |
| ------------------- | ---------- | ------ | ------ |
| Technical Accuracy  | **\_\_\_** | **\_** | **\_** |
| Style & Consistency | **\_\_\_** | **\_** | **\_** |
| Completeness        | **\_\_\_** | **\_** | **\_** |
| Final Approval      | **\_\_\_** | **\_** | **\_** |

---

**Note:** This checklist should be used for all documentation to ensure
consistency across the project. Store completed checklists with their
corresponding documents for audit purposes.
