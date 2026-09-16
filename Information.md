# TosynUI — Founder Vision and Product Identity

**Founder:** Ali Sulman  
**Updated:** 15 September 2026  
**Working name:** TosynUI  
**Name origin:** Token + Syntax + UI  
**Project reference:** [alisulmanpro/TosynUI](https://github.com/alisulmanpro/TosynUI)  
**Document purpose:** Explain the complete current vision to a future AI assistant, developer, designer, or collaborator.

> **A shared interface language that AI can use efficiently and humans can read, understand, and confidently edit.**

## 1. Read this first

TosynUI is a proposed class-based UI library whose **primary user is AI and secondary user is the human developer**.

The founder wants AI to generate attractive, consistent interfaces through a concise and understandable design language. When a human opens the generated code, they should be able to follow the structure, styling intent, and purpose of the interface without untangling large amounts of repetitive styling.

The larger ambition is to build **an independent AI product for advanced UI/UX design and frontend implementation**. TosynUI is intended to become a foundation for that product while also being useful to other AI coding tools and human developers.

This document records product identity and desired outcomes. It does not select the implementation method, define a roadmap, or claim that these capabilities already exist.

## 2. The founder's imagination, expressed in simple English

The following is a paraphrase of the founder's stated vision, rather than a verbatim quotation:

> I want to build a UI library primarily for AI. AI should use it to create beautiful, consistent interfaces with concise code and less repeated work. A human developer should be able to open that code and understand the whole story of the interface, then make changes comfortably.
>
> I imagine a class-based system. Shared design values define the visual foundation, and simple classes express components. For example, a button should receive a complete default appearance through a short class such as `btn`, with extra detail only when it is needed.
>
> My ambition extends to my own advanced AI tool for UI/UX design and frontend implementation. I want the library and the tool to offer a meaningful new approach, solve real problems, and become work that earns professional recognition. We will decide how to implement this after we understand the product clearly.

## 3. Who the product serves

| Audience | Role | What the product should provide |
| --- | --- | --- |
| AI coding and design systems | Primary users of the library | A predictable vocabulary, clear design rules, relevant context, and useful correction feedback |
| Human developers | Secondary users of the library; owners and maintainers of generated work | Readable source, understandable design decisions, easy customization, and reliable editing |
| Designers and collaborators | Potential reviewers and contributors | A clear connection between visual decisions and the implemented interface |
| Application users | People using the resulting interfaces | Usable, responsive, accessible, attractive experiences |

“AI first” describes how the library is designed and documented. Human readability remains a core requirement. AI convenience should not turn the output into cryptic source code.

## 4. The problems motivating TosynUI

### 4.1 Generated code can be difficult to understand

Long styling expressions, repeated values, arbitrary names, and inconsistent structure can make even a small change difficult. A developer may see how something looks without understanding which part of the source controls it.

**Desired outcome:** the interface's structure and styling intent are easy to follow in the source, and detailed styling remains discoverable when needed.

### 4.2 AI repeats work and design decisions

An assistant may repeatedly recreate familiar component styling, request broad documentation, or reconstruct decisions that were already made elsewhere in the application.

**Desired outcome:** reusable definitions and focused information reduce unnecessary generation, repeated decisions, and repair work.

### 4.3 Design can drift across screens and edits

Individually acceptable pages can have different spacing, typography, colors, shapes, or motion. A later edit may weaken the consistency of an earlier result.

**Desired outcome:** shared design decisions remain available and are applied consistently across related screens.

### 4.4 Attractive output also needs good interaction design

A polished screenshot does not describe loading behavior, errors, keyboard interaction, responsive layout, or the outcome of an action.

**Desired outcome:** UI appearance, UX behavior, frontend structure, and purposeful animation are considered together.

### 4.5 AI-generated work must remain maintainable

The human developer should be able to understand and improve the result after generation. The project should not require the original conversation merely to explain its styling choices.

**Desired outcome:** design knowledge is represented in the project in a form that both humans and AI can inspect.

These are the founder's target problems. Their frequency, severity, and improvement through TosynUI still need validation.

## 5. The class-based foundation

The founder explicitly prefers a system with shared design values and short, meaningful component classes.

Conceptually, shared root variables establish colors, typography, spacing, shapes, and motion. Classes apply those decisions to interface elements. The exact token format, class syntax, naming conventions, and framework integration remain open.

The example `btn` communicates the desired simplicity. It is not a finalized public API.

The intended experience is:

- A simple class gives a component a complete, sensible default appearance.
- Common variations use a small and understandable vocabulary.
- Related elements draw from shared design values.
- Humans can trace a class to its definition and customize the result.
- AI receives precise guidance about supported usage.
- Complex cases can express additional intent without making simple cases verbose.

**Readable brevity is the goal.** Extremely compressed names that humans cannot understand would work against the founder's intention.

Short classes express reusable styling. They do not independently provide every interaction, infer business logic, or guarantee accessibility. The eventual product must clearly describe which behavior comes from native elements, which needs additional implementation, and which is supplied by TosynUI.

## 6. What “understand the whole story” means

A developer looking at generated source should be able to answer:

- What are the major sections of this interface?
- Which elements are components, and what are their roles?
- Which action is most important in this section?
- Which shared design choices determine the appearance?
- Where can I change a local detail or a project-wide decision?
- What states and interactions does this screen support?
- What other parts of the interface might be affected by my change?

For example, a developer reviewing a settings screen should recognize its sections, fields, feedback, and actions without decoding every low-level visual property. They should still be able to inspect those properties when customization requires it.

This connects the name's two ideas: **Token** represents the founder's interest in efficient AI usage; **Syntax** represents understandable expression and source code.

The project also discusses design tokens, meaning named design values. Model tokens and design tokens are different concepts even though they use the same word.

## 7. The intended difference

The proposed identity combines several outcomes:

| Product quality | Intended meaning for TosynUI |
| --- | --- |
| Designed primarily for AI | AI can discover the library's supported vocabulary and apply its rules with limited guesswork |
| Understandable to humans | Generated source remains readable, editable, and explainable |
| Concise class-based expression | Reusable styles reduce repetitive low-level markup |
| Application-wide consistency | Shared design decisions survive new screens and later edits |
| Visual and interaction quality | Layout, hierarchy, states, responsiveness, and motion receive attention |
| Foundation for an owned AI product | The same design language can support the founder's future UI/UX and frontend tool |

Short classes, theming, and AI documentation are individually established ideas. TosynUI's intended differentiation is the quality of the combined workflow: **AI creates through a clear design language, and a human can comfortably understand and continue the work.**

A more ambitious direction discussed is to represent relationships within an interface and explain the effects of design changes. This could strengthen the product, but its feature scope and implementation have not been approved.

The founder wants a distinctive, influential product. This document does not establish market uniqueness or proven superiority.

## 8. Two connected parts of the long-term vision

### Part A — TosynUI, the library

The library provides the proposed class-based interface language and shared design foundation. Its primary consumers are AI systems, with direct human use also supported as a product goal.

It should be possible for a developer to understand the generated output using the library's definitions and documentation. The precise packaging and independence requirements remain to be decided.

### Part B — The founder's own AI product

The founder explicitly wants an advanced AI tool that performs UI/UX design and frontend implementation.

The desired experience extends from understanding the requested interface to producing a useful implementation and supporting later changes. The degree of automation, interaction model, and boundaries of responsibility are still open.

TosynUI could provide this tool with a consistent language for expressing and modifying interfaces. The AI tool could make higher-level design and implementation decisions using that language.

“My own AI tool” establishes ownership of the product vision. It does not establish a requirement to train a foundation model, create a proprietary model, or choose any particular model provider.

### How they relate

| Library | Future AI product |
| --- | --- |
| Defines a reusable interface vocabulary | Uses that vocabulary while working on a user's request |
| Expresses shared styling and design decisions | Proposes and applies design decisions within its eventual scope |
| Supports understandable source | Produces and edits frontend implementations |
| Can support other AI tools | Is the founder's own advanced experience built around the vision |

These are related product concepts. Their release order, technical boundaries, and commercial model remain undecided.

## 9. How an AI could recognize and use the library

An AI does not automatically know that a new library was designed for it. The library needs discoverable information and an integration path appropriate to the tool using it.

At the product level, the requirement is that AI can find:

- The library and version used by the project.
- Supported classes, combinations, and required structure.
- The project's selected design decisions.
- Relevant examples and limitations.
- Feedback about incorrect usage where validation is available.

Documentation, project instructions, agent skills, structured catalogs, and tool integrations were discussed as possible mechanisms. None is a settled implementation requirement. Merely adding an “AI-ready” label or a file does not ensure that all AI clients will read it.

## 10. Desired qualities and evidence boundaries

| Desired quality | What eventual evidence would need to show |
| --- | --- |
| Lower model-token usage | Complete task usage, including setup context, tool responses, and repairs |
| Easier human editing | Developers can understand and change generated output with less confusion |
| Better consistency | Related screens follow the declared design decisions across changes |
| Attractive interfaces | Human review of hierarchy, spacing, typography, and visual coherence |
| Better UX | Working states, navigation, feedback, and responsive interactions |
| Useful animation | Motion supports understanding and respects user preferences |

No numerical efficiency claim, adoption figure, or quality result has been established in this discussion. Efficiency should be pursued alongside readability and usable output.

## 11. Platform ambition

The original ambition included websites, Android applications, and desktop applications. The latest clarification emphasizes advanced UI/UX and frontend implementation through a class-based library and a future AI tool.

The platform ambition remains broad, but the supported platforms and their implementation methods are undecided. CSS classes naturally describe web styling; native Android support would require an appropriate separate implementation or translation approach. The long-term vision should not be interpreted as a claim that one CSS library already works in every runtime.

## 12. Confirmed direction, proposals, and open decisions

### Confirmed by the founder

- AI is the primary library user; humans are secondary users.
- Human readability and ease of editing are essential.
- The foundation should be class-based, with short meaningful expressions.
- Shared design values should support reusable component styling.
- Reducing inconsistency and unnecessary AI-token usage are desired outcomes.
- UI, UX, animation, and frontend quality belong within the broader ambition.
- The founder wants his own advanced AI tool for UI/UX and frontend implementation.
- The product should create professional value and has an ambition for wider recognition.
- Product understanding comes before implementation planning.
- TosynUI is the current working name, derived from Token + Syntax.

### Discussed possibilities, not finalized commitments

- Persistent project design profiles.
- Checks for unsupported classes and design-rule violations.
- Explicit relationships between components and actions.
- Controlled project-wide transformations with previews and explanations.
- A shared definition that produces styling, documentation, and AI references.
- A visual inspector showing the source and effect of design decisions.
- Specific AI integrations or a machine-readable catalog.

### Decisions deliberately left open

- Final brand name and the name of the future AI product.
- Exact class syntax, prefixes, customization rules, and variable format.
- Whether the library depends on another styling framework.
- Framework support, interaction implementation, and platform adapters.
- The balance between AI-proposed visual direction and explicit human control.
- Model providers, orchestration, training, hosting, and deployment.
- Whether any AI is involved when a generated application runs.
- Licensing, pricing, distribution, and commercial strategy.
- Initial feature inventory, release order, timeline, and task breakdown.

## 13. Naming perspective

**Recommendation: retain TosynUI as the working library name.**

It connects to the founder's stated origin and gives the project a coherent story: efficient expression for AI and readable syntax for people. The meaning will need a short explanation because it is not immediately obvious from the name alone.

A possible future naming structure is:

| Name | Possible role | Status |
| --- | --- | --- |
| Tosyn | Umbrella product identity | Naming suggestion |
| TosynUI | Class-based library | Current working name |
| Tosyn Studio | Future UI/UX and frontend AI product | Naming suggestion |

These suggestions preserve continuity while allowing the larger product to grow beyond a library. No domain, package-name, or trademark availability has been checked. This is a creative naming recommendation, not availability clearance.

Suggested positioning line:

> **Built for AI. Readable by humans.**

Suggested explanatory sentence:

> TosynUI is a class-based interface library designed for AI generation and human understanding, with a long-term vision of powering advanced UI/UX design and frontend implementation.

## 14. Context for future collaborators and AI assistants

The earlier `plan.md` was an exploratory proposal produced before the founder clarified the class-based foundation, the explicit AI-primary audience, and the ambition for an owned AI product.

Use this document as the current statement of product intent. Do not assume that the earlier React-oriented architecture, technology choices, milestones, component counts, or deadlines are approved. This document does not rewrite that earlier file; it clarifies how it should be interpreted.

When continuing the discussion:

- Preserve the distinction between confirmed intentions and proposed features.
- Explain suggestions in clear language and connect them to the target problems.
- Keep AI usability and human source readability together.
- Discuss meaningful differentiation without inventing novelty or performance claims.
- Treat the library and the future AI product as related but distinct concepts.
- Establish product decisions with the founder before converting them into an implementation plan.

## 15. One-paragraph handoff

Ali Sulman is developing the vision for TosynUI, a class-based UI library named from Token + Syntax. Its primary user is AI; its secondary user is the human developer who must understand and edit the generated source. The intended foundation is shared design values and short meaningful classes that help AI create attractive, consistent interfaces with less repetitive work and potentially lower token usage. The ambition includes UI, UX, animation, and maintainable frontend implementation, with websites, Android, and desktop present in the broader vision. Ali also wants his own advanced AI product for UI/UX design and frontend implementation, potentially powered by this library. The product is still being defined. Technology, exact syntax, automation boundaries, platform implementation, licensing, roadmap, and tasks remain open. Discuss and clarify the product before planning how to build it.
