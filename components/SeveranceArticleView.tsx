import React, { useState } from 'react';
import { AppView } from '../types';

interface SeveranceArticleViewProps {
  articleId: string | undefined;
  onBack: () => void;
}

// Article content - word for word from the PDFs
const ARTICLE_CONTENT: Record<string, { title: string; content: string }> = {
  'understanding-basics': {
    title: 'Understanding Severance Pay: The Basics',
    content: `# Understanding Severance Pay: The Basics

## What Is Severance Pay?

Severance pay is compensation and benefits an employer provides to an employee after their employment has ended. It's typically offered when an employee is laid off, their position is eliminated due to downsizing, or they retire. Some employees who resign or are terminated may also receive a severance package depending on the circumstances and company policy.

Severance packages can include various forms of compensation beyond just monetary payment. A comprehensive package might include continued salary for a specified period, extended health insurance coverage, retirement benefits, stock options, outplacement services to help find new employment, and payment for accrued vacation or sick time.

## Is Severance Pay Required by Law?

Under federal law in the United States, employers are generally not required to provide severance pay. According to the U.S. Department of Labor, severance pay is 'a matter of agreement between an employer and an employee.' However, there are important exceptions:

- Employment contracts that specifically promise severance pay
- Company policies outlined in employee handbooks that establish severance practices
- Collective bargaining agreements with unions that include severance provisions
- Implied contracts created through consistent past practices of paying severance
- The WARN Act, which may require some severance-like payments during mass layoffs

## Common Components of Severance Packages

While severance packages vary significantly between employers and industries, most include some combination of the following elements:

**Severance Pay**: The core monetary component, typically calculated based on years of service. A common formula is one to two weeks of salary for each year worked at the company. Senior executives often receive more generous terms.

**Health Insurance Continuation**: Many employers offer to continue paying for health insurance premiums for a specified period, or provide a subsidy for COBRA coverage.

**Outplacement Services**: Some companies provide job search assistance, resume writing help, and career counseling to help departing employees find new positions.

**Accrued Benefits**: Payment for unused vacation days, sick time, or earned bonuses that haven't yet been paid out.

## Who Typically Receives Severance?

Severance is most commonly offered in situations where the employee is leaving through no fault of their own. This includes layoffs due to economic conditions, position eliminations, company restructuring, mergers and acquisitions, and facility closures. Employees who are terminated for cause (such as misconduct or poor performance) typically do not receive severance, though there are exceptions for senior executives with employment contracts.

## Why Do Companies Offer Severance?

Employers offer severance for several strategic reasons. First, it demonstrates goodwill and helps maintain a positive employer brand, which is important for attracting future talent. Second, severance packages typically include a release of claims, meaning the employee agrees not to sue the company for wrongful termination or discrimination. This legal protection is often worth the cost of the severance payment to the employer.

## Official Resources

- U.S. Department of Labor - Severance Pay: https://www.dol.gov/general/topic/wages/severancepay
- Fair Labor Standards Act Information: https://www.dol.gov/agencies/whd/flsa
- EEOC - Understanding Waivers in Severance Agreements: https://www.eeoc.gov/laws/guidance/qa-understanding-waivers-discrimination-claims-employee-severance-agreements

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Laws vary by state and individual circumstances. Consult with a qualified employment attorney for advice specific to your situation.`
  },
  'how-to-calculate': {
    title: 'How to Calculate Severance Pay',
    content: `# How to Calculate Severance Pay

## Standard Severance Formulas

While there's no universal formula for calculating severance pay, most companies use variations of a few common approaches. The most widely used formula provides one to two weeks of pay for each year of service with the company. For example, an employee who worked at a company for five years might receive between five and ten weeks of severance pay.

The calculation typically uses the employee's regular base salary, not including bonuses, commissions, or overtime pay—though some companies may include these in their calculations. Here's a basic example:

### Example Calculation:

- Annual Salary: $60,000
- Weekly Salary: $60,000 ÷ 52 = $1,154
- Years of Service: 8 years
- Severance Formula: 1 week per year
- Total Severance: $1,154 × 8 = $9,232

## Factors That Affect Severance Amounts

**Length of Service:** This is typically the primary factor. Longer-tenured employees usually receive larger severance packages. Some companies have tiered systems where employees with more years receive proportionally more per year.

**Position and Seniority:** Executive and management-level employees often receive more generous severance terms. Entry-level employees might receive one week per year, while executives might receive one month per year or more.

**Company Policy:** Some organizations have established severance policies that apply uniformly to all employees. Others calculate severance on a case-by-case basis.

**Industry Standards:** Certain industries have higher severance norms. Tech companies and financial services firms, for example, often offer more generous packages than other sectors.

**Reason for Separation:** Employees laid off due to corporate restructuring may receive better packages than those terminated for performance issues.

## Beyond Base Severance Pay

When calculating the total value of a severance package, consider these additional components:

**Health Insurance:** If your employer offers to pay COBRA premiums for several months, this could be worth thousands of dollars. COBRA coverage typically costs the full premium plus a 2% administrative fee, which employees normally share with their employer.

**Unused Vacation/PTO:** Many states require employers to pay out accrued vacation time. Even in states where it's not required, many employers include this in severance packages.

**Bonus and Commission:** Prorated bonuses or earned commissions that haven't been paid may be included in your severance package.

**Stock Options and RSUs:** Some severance agreements include provisions for accelerated vesting of stock options or restricted stock units.

## Lump Sum vs. Salary Continuation

Severance can be paid in two main ways:

**Lump Sum Payment:** You receive the entire amount at once. This gives you immediate access to all funds and a clean break from your former employer. However, it may push you into a higher tax bracket for that year.

**Salary Continuation:** Your paychecks continue on the regular schedule until the severance period ends. This can help with tax planning and may allow continued health benefits. However, it maintains a connection with your former employer longer.

## Official Resources

- U.S. Office of Personnel Management - Severance Pay Worksheet: https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/severance-pay-estimation-worksheet/
- IRS - Tax Information for Severance Pay: https://www.irs.gov/taxtopics/tc410
- Department of Labor - Wages Information: https://www.dol.gov/agencies/whd/fact-sheets

DISCLAIMER: This article is for informational purposes only and does not constitute legal or financial advice. Consult with qualified professionals for advice specific to your situation.`
  },
  'negotiating': {
    title: 'Negotiating Your Severance Package',
    content: `# Negotiating Your Severance Package

## Yes, You Can Negotiate

Many employees don't realize that severance packages are often negotiable. Research indicates that a significant majority of employees who attempt to negotiate their severance terms are successful in improving at least some aspect of their package. The initial offer is typically a starting point, not the employer's final position.

Remember that your employer has reasons for offering severance—primarily, they want you to sign a release of claims. This release is valuable to them, which gives you negotiating leverage.

## Before You Negotiate: Take Your Time

Don't sign anything immediately. Federal law requires that employees 40 and older be given at least 21 days to consider a severance agreement (45 days in group layoffs). Even younger employees should ask for time to review the offer. This period allows you to:

- Review the entire agreement carefully and understand all terms
- Research what similar severance packages include in your industry
- Consult with an employment attorney if needed
- Evaluate your potential legal claims, if any
- Prepare your negotiation strategy

## Key Areas to Negotiate

**Severance Pay Amount:** This is the most obvious area for negotiation. Consider your years of service, contributions to the company, and industry standards. If the offer is below the typical one-to-two weeks per year, you have a strong case to ask for more.

**Health Insurance:** Negotiate for the company to continue paying for your health insurance coverage, or to contribute toward COBRA premiums for a longer period. This can be worth thousands of dollars and provides crucial coverage during your job search.

**Timing of Payment:** Request a lump sum payment if you prefer immediate access to funds, or negotiate salary continuation if you want to remain on the company's benefits longer. Each approach has different tax implications worth considering.

**Reference and Recommendation:** Negotiate what the company will say when future employers call for a reference. Get agreement on specific positive language in writing. This is especially important if your departure was contentious.

**Non-Compete Clauses:** If the agreement includes non-compete provisions, negotiate to reduce the duration, geographic scope, or industry restrictions. Overly broad non-competes can significantly limit your job search.

**Unemployment Benefits:** Ask the company to agree not to contest your unemployment claim. While you may be eligible regardless, having this in writing prevents potential complications.

## Effective Negotiation Strategies

**Know Your Value:** Document your contributions to the company—successful projects, cost savings, client relationships, and other achievements. This provides justification for a better package.

**Be Professional:** Approach negotiations calmly and professionally. Avoid being confrontational or emotional. Maintain a positive relationship—you may need references or networking connections later.

**Make Reasonable Requests:** Asking for significantly more than industry standards may be counterproductive. Focus on specific, justified improvements rather than demanding an unrealistic package.

**Get Everything in Writing:** Any modifications to the severance agreement should be documented in writing before you sign. Oral promises are difficult to enforce.

## When to Consult an Attorney

Consider consulting an employment attorney if: your severance offer is substantial; you believe you may have legal claims against your employer (discrimination, harassment, wrongful termination); the agreement contains complex provisions you don't understand; or non-compete clauses could significantly impact your career. Many employment attorneys offer free initial consultations.

## Official Resources

- EEOC - Understanding Waivers in Severance: https://www.eeoc.gov/laws/guidance/qa-understanding-waivers-discrimination-claims-employee-severance-agreements
- State Bar Association Lawyer Referral Services: https://www.americanbar.org/groups/lawyer_referral/
- Department of Labor - Employee Rights: https://www.dol.gov/general/topic/termination

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Consult with a qualified employment attorney for advice specific to your situation.`
  },
  'understanding-agreements': {
    title: 'Understanding Severance Agreements and Releases',
    content: `# Understanding Severance Agreements and Releases

## What Is a Severance Agreement?

A severance agreement is a legally binding contract between an employer and a departing employee that outlines the terms of separation. In exchange for receiving severance benefits, employees typically agree to release the employer from potential legal claims and may accept other conditions such as confidentiality requirements or non-compete clauses.

Understanding what you're agreeing to is crucial before signing any severance agreement. Once signed, these agreements are generally enforceable and can limit your future legal options against your employer.

## Release of Claims Explained

The release of claims (also called a waiver) is often the most important part of a severance agreement from the employer's perspective. By signing, you typically agree to waive your right to sue the company for various potential claims, including:

- Wrongful termination
- Discrimination (based on age, race, gender, disability, etc.)
- Harassment
- Retaliation
- Breach of contract
- Wage and hour violations
- Other employment-related claims

This release is usually broad and covers claims you know about as well as those you may not yet be aware of. However, you cannot waive certain rights, such as:
- Rights to unemployment benefits
- Rights to workers' compensation benefits
- Rights to file charges with government agencies (though you may waive the right to recover damages)
- Rights to vested retirement benefits

## Common Provisions in Severance Agreements

**Confidentiality/Non-Disclosure:** You may agree not to discuss the terms of your severance or disparage the company. Be aware that overly broad confidentiality clauses may be unenforceable if they prevent you from discussing workplace conditions.

**Non-Compete Clauses:** These restrict your ability to work for competitors or start a competing business for a specified period and geographic area. The enforceability of non-competes varies significantly by state.

**Non-Solicitation:** You may agree not to solicit the company's employees or customers for a period of time.

**Return of Company Property:** Agreement to return all company property, including devices, documents, and confidential information.

**Cooperation:** You may agree to cooperate with the company in any ongoing or future legal matters.

## Review Period and Revocation Rights

Federal law provides special protections for employees 40 and older under the Older Workers Benefit Protection Act (OWBPA):

- You must be given at least 21 days to consider the agreement (45 days in group layoffs)
- You have 7 days after signing to revoke the agreement
- The agreement must advise you in writing to consult with an attorney

Even if you're under 40, it's wise to request time to review the agreement and consult with an attorney.

## What Happens After You Sign

Once you sign the agreement (and any revocation period passes), it becomes legally binding (subject to any revocation period). Keep a copy for your records. If you believe the employer subsequently violates the agreement—for example, by failing to pay the promised severance or providing negative references when they agreed not to—you may have grounds for a breach of contract claim.

## Official Resources

- EEOC - Waivers of Discrimination Claims: https://www.eeoc.gov/laws/guidance/qa-understanding-waiver-s-discrimination-claims-employee-severance-agreements
- Department of Labor - Termination: https://www.dol.gov/general/topic/termination
- National Labor Relations Board - Employee Rights: https://www.nlrb.gov/about-nlrb/rights-we-protect/your-rights

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Consult with a qualified employment attorney before signing any severance agreement.`
  },
  'taxes-on-severance': {
    title: 'Taxes on Severance Pay: What You Need to Know',
    content: `# Taxes on Severance Pay: What You Need to Know

## Is Severance Pay Taxable?

Yes, severance pay is considered taxable income by the IRS. The U.S. Supreme Court confirmed in 2014 (United States v. Quality Stores, Inc.) that severance payments are wages subject to federal income tax and FICA taxes (Social Security and Medicare). This means your severance will be taxed similarly to your regular wages.

State income taxes also apply in states that have income taxes. The specific tax treatment may vary slightly by state, so consult your state tax authority for details.

## How Severance Is Taxed

Severance pay is classified as 'supplemental wages' for federal income tax purposes. Employers must withhold income tax from severance payments using one of two methods:

**Flat Rate Method:** Employers withhold federal income tax at a flat 22% rate from supplemental wages under $1 million. This is the most common method for severance payments.

**Aggregate Method:** Employers combine severance with your regular wages for the pay period and calculate withholding based on the total amount using the standard wage bracket method from IRS Publication 15-T.

In addition to income tax, your employer will withhold FICA taxes: 6.2% for Social Security (up to the annual wage base) and 1.45% for Medicare (plus an additional 0.9% for high earners).

## Tax Bracket Considerations

A large lump-sum severance payment could temporarily push you into a higher tax bracket for the year. For example, if you normally earn $75,000 and receive a $50,000 severance payment in the same tax year, your total income of $125,000 would be subject to higher marginal tax rates on some of that income.

However, keep in mind that only the income above each bracket threshold is taxed at the higher rate—you don't pay the higher rate on all your income. Still, this 'bracket creep' is worth considering when negotiating severance timing.

## Strategies to Manage Severance Taxes

**Defer Payment to Next Year:** If you're terminated late in the year, you might negotiate to have your severance paid in January of the following year. This delays the tax impact and could result in a lower effective tax rate if your income is lower the following year while job searching.

**401(k) Contributions:** If your employer allows it, you may be able to contribute some of your severance to your 401(k) plan, reducing your taxable income for the year. Check with your employer about whether this is permitted.

**Gross-Up Provisions:** Some employers will 'gross up' severance payments, meaning they increase the payment amount to cover the taxes owed. This way, you receive your full intended severance after taxes. This is more common in executive severance packages.

**Salary Continuation:** Receiving severance as salary continuation (regular paychecks over time) rather than a lump sum spreads the income across multiple pay periods, which might result in more appropriate withholding, though the total tax owed remains the same.

## What About Other Severance Benefits?

**Unused Vacation/PTO Payout:** Taxable as ordinary income, just like wages.

**Outplacement Services:** Generally not taxable if provided directly by the employer rather than as a cash payment you can spend freely.

**Health Insurance Premiums:** If your employer pays for continued health coverage, this benefit may be tax-free under certain circumstances. COBRA premiums you pay are not tax deductible unless your total medical expenses exceed 7.5% of your adjusted gross income.

**Stock Options:** Tax treatment depends on the type of options and when they're exercised. Consult a tax professional for guidance.

## Filing Your Taxes After Severance

Your severance will be included on your W-2 form from your former employer. If you received severance and started a new job in the same year, you'll have W-2s from both employers to report on your tax return.

If the 22% flat-rate withholding on your severance was too much or too little based on your actual tax situation, you'll reconcile this when you file your annual return—either receiving a refund or owing additional taxes.

## When to Consult a Tax Professional

Consider consulting a tax professional if: your severance is substantial; you have stock options or equity compensation; you're considering timing strategies for severance payment; you want to explore retirement account contribution strategies; or you have complex financial situations that severance might affect.

## Official Resources

- IRS - Supplemental Wages Withholding: https://www.irs.gov/publications/p15
- IRS - Tax Topic 410 Pensions and Annuities: https://www.irs.gov/taxtopics/tc410
- IRS - Publication 525 Taxable and Nontaxable Income: https://www.irs.gov/publications/p525
- Find a Tax Professional: https://irs.treasury.gov/rpo/rpo.jsf

DISCLAIMER: This article is for informational purposes only and does not constitute tax advice. Tax laws are complex and change frequently. Consult with a qualified tax professional for advice specific to your situation.`
  },
  'cobra-health-insurance': {
    title: 'COBRA Health Insurance After Job Loss',
    content: `# COBRA Health Insurance After Job Loss

## What Is COBRA?

COBRA (Consolidated Omnibus Budget Reconciliation Act) is a federal law that allows you to continue your employer-sponsored health insurance coverage after your employment ends. This applies to group health plans offered by employers with 20 or more employees.

COBRA gives you the right to continue the same health coverage you had while employed, but you'll be responsible for paying the full premium plus a 2% administrative fee. This can be significantly more expensive than what you paid as an employee, since your employer is no longer contributing to the cost.

## Who Is Eligible for COBRA?

You're eligible for COBRA if:
- You were covered by your employer's group health plan on the day before a "qualifying event"
- The qualifying event causes you to lose coverage
- Your employer has 20 or more employees

Qualifying events include:
- Termination of employment (voluntary or involuntary, except for gross misconduct)
- Reduction in hours that causes loss of coverage
- Divorce or legal separation from a covered employee
- Death of a covered employee
- A child losing dependent status

## How Long Does COBRA Coverage Last?

COBRA coverage typically lasts for 18 months after your qualifying event. However, coverage can be extended to 36 months in certain circumstances, such as:
- A second qualifying event (like divorce) during the initial 18-month period
- Disability (if you're determined to be disabled within 60 days of the qualifying event)

## COBRA Costs

Under COBRA, you pay the full cost of the premium plus a 2% administrative fee. This means if your employer was paying part of your premium, you'll now pay that portion plus your previous share. For example, if your monthly premium was $500 and your employer paid $400, you'd pay $100. Under COBRA, you'd pay the full $500 plus 2%, totaling $510 per month.

## Alternatives to COBRA

Before choosing COBRA, consider these alternatives:

**Marketplace Plans (HealthCare.gov):** You may qualify for a Special Enrollment Period when you lose job-based coverage. Marketplace plans may be more affordable, especially if you qualify for premium tax credits.

**Spouse's Plan:** If your spouse has employer-sponsored coverage, you may be able to join their plan.

**Medicaid:** If your income is low enough, you may qualify for Medicaid coverage.

**Short-Term Health Insurance:** Temporary coverage options, though these typically offer less comprehensive benefits.

## Making the Decision

When deciding whether to elect COBRA:
- Compare COBRA costs to Marketplace plans
- Consider your health needs and whether you're in the middle of treatment
- Factor in whether you expect to find new coverage soon
- Remember you have 60 days to decide and 45 days to make your first payment

## Official Resources

- U.S. Department of Labor - COBRA Continuation Coverage: https://www.dol.gov/general/topic/health-plans/cobra
- HealthCare.gov - Special Enrollment Period: https://www.healthcare.gov/coverage-outside-open-enrollment/special-enrollment-period/
- CMS - COBRA Information: https://www.cms.gov/CCIIO/Programs-and-Initiatives/Health-Insurance-Marketplaces/SEP

DISCLAIMER: This article is for informational purposes only and does not constitute legal or financial advice. Consult with qualified professionals for advice specific to your situation.`
  },
  'severance-unemployment': {
    title: 'Severance and Unemployment Benefits',
    content: `# Severance and Unemployment Benefits

## How Severance Affects Unemployment

Receiving severance pay can impact your eligibility for unemployment benefits, but the rules vary by state. In general, severance pay may delay when you can start collecting unemployment benefits, but it doesn't necessarily disqualify you entirely.

## State-by-State Variations

Each state has its own rules about how severance affects unemployment benefits:

**States That Delay Benefits:** Many states require you to wait until your severance period ends before you can collect unemployment. For example, if you receive 8 weeks of severance, you may need to wait 8 weeks before filing for unemployment.

**States That Don't Count Severance:** Some states don't count severance pay as wages that would delay unemployment benefits. In these states, you may be able to collect unemployment immediately, even while receiving severance.

**States With Partial Impact:** Some states have complex rules where certain types of severance payments delay benefits while others don't.

## Types of Severance Payments

The type of severance payment can matter:

**Lump Sum Payments:** A one-time payment may be treated differently than ongoing payments. Some states consider lump sums as wages for the period they're intended to cover.

**Salary Continuation:** If you're receiving regular paychecks as severance, most states will consider this as wages that delay unemployment benefits.

**Accrued Vacation/PTO:** Payment for unused vacation time is typically considered wages and may delay unemployment benefits.

## Best Practices

1. **Check Your State's Rules:** Contact your state unemployment office to understand exactly how severance affects your benefits.

2. **File Promptly:** Even if severance delays your benefits, file your unemployment claim as soon as you're eligible. Don't wait until your severance runs out.

3. **Document Everything:** Keep records of all severance payments, dates, and correspondence with your former employer.

4. **Don't Assume:** Don't assume you're ineligible just because you received severance. The rules are complex and vary significantly.

## Negotiating Severance and Unemployment

When negotiating your severance package, consider asking your employer to:
- Structure payments in a way that doesn't delay unemployment benefits (if legally possible in your state)
- Provide a letter confirming your separation date and that you're eligible for unemployment
- Agree not to contest your unemployment claim

## Official Resources

- U.S. Department of Labor - State Unemployment Insurance: https://www.dol.gov/general/topic/unemployment-insurance
- CareerOneStop - Unemployment Benefits Finder: https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/find-unemployment-benefits.aspx

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Unemployment rules vary significantly by state. Consult with your state unemployment office or a qualified attorney for advice specific to your situation.`
  },
  'rights-over-40': {
    title: 'Rights for Workers Over 40 (OWBPA)',
    content: `# Rights for Workers Over 40 (OWBPA)

## What Is the Older Workers Benefit Protection Act?

The Older Workers Benefit Protection Act (OWBPA) is a federal law that provides special protections for workers age 40 and older when they're asked to sign a waiver or release of claims in connection with an employment termination. The OWBPA is an amendment to the Age Discrimination in Employment Act (ADEA).

## Key Protections Under OWBPA

If you're 40 or older and your employer offers you a severance package in exchange for signing a release of claims, the OWBPA requires:

**Minimum Review Period:** You must be given at least 21 days to consider the agreement before signing. In group layoffs (two or more employees), you must be given at least 45 days.

**Revocation Period:** After signing, you have 7 days to revoke (cancel) the agreement. The agreement doesn't become effective until this 7-day period passes.

**Written Advice:** The agreement must advise you in writing to consult with an attorney before signing.

**Clear Language:** The waiver must be written in plain language that you can understand.

**Consideration:** You must receive something of value (the severance) in exchange for signing the waiver.

## Group Layoff Requirements

If you're part of a group layoff (two or more employees), additional requirements apply:

**45-Day Review Period:** You must receive at least 45 days to consider the agreement.

**Disclosure of Information:** Your employer must provide you with:
- A list of the job titles and ages of all employees in your "decisional unit" (the group of employees from which selections were made)
- A list of the job titles and ages of all employees in the same decisional unit who were selected for termination
- A list of the job titles and ages of all employees in the same decisional unit who were not selected for termination

This information helps you determine if age discrimination may have played a role in the layoff decisions.

## What You Cannot Waive

Even with a valid OWBPA waiver, you cannot waive:
- Your right to file a charge with the Equal Employment Opportunity Commission (EEOC)
- Your right to participate in an EEOC investigation or proceeding
- Your right to challenge the validity of the waiver itself

However, you can waive your right to recover monetary damages in a lawsuit.

## If Your Rights Are Violated

If your employer doesn't follow OWBPA requirements, the waiver may be invalid. This means:
- You may still be able to pursue age discrimination claims
- You may be able to keep the severance and still sue
- The employer may face penalties

## When to Consult an Attorney

Given the complexity of OWBPA requirements, it's highly recommended that workers 40 and older consult with an employment attorney before signing any severance agreement. Many attorneys offer free initial consultations.

## Official Resources

- EEOC - Age Discrimination: https://www.eeoc.gov/age-discrimination
- EEOC - Understanding Waivers: https://www.eeoc.gov/laws/guidance/qa-understanding-waivers-discrimination-claims-employee-severance-agreements
- U.S. Department of Labor - ADEA: https://www.dol.gov/general/topic/discrimination/agedisc

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Consult with a qualified employment attorney for advice specific to your situation.`
  },
  '401k-rollover-guide': {
    title: '401(k) Rollover Guide: Moving Your Retirement Savings',
    content: `# 401(k) Rollover Guide: Moving Your Retirement Savings

## What Is a 401(k) Rollover?

A 401(k) rollover is the process of moving money from your former employer's retirement plan to another retirement account, such as an Individual Retirement Account (IRA) or a new employer's 401(k) plan. When done correctly, a rollover allows you to maintain the tax-advantaged status of your retirement savings without incurring taxes or penalties.

When you leave a job—whether due to layoff, resignation, or retirement—you typically have several options for your 401(k) funds. Understanding these options helps you make the best decision for your retirement savings.

## Your Four Options When Leaving a Job

### Option 1: Roll Over to an IRA

Moving your 401(k) to an IRA is one of the most popular options. An IRA typically offers more investment choices than an employer plan, potentially lower fees, and you maintain control of your money regardless of future job changes. You can roll over to a traditional IRA (keeping the tax-deferred status) or convert to a Roth IRA (paying taxes now for tax-free withdrawals later).

### Option 2: Roll Over to Your New Employer's Plan

If your new employer offers a 401(k) and accepts rollovers, you can consolidate your old 401(k) into the new plan. This keeps all your workplace retirement savings in one place and may offer institutional pricing on investments.

### Option 3: Leave It With Your Former Employer

If your balance is over $7,000, most plans allow you to leave your money where it is. Your savings continue to grow tax-deferred, but you won't be able to make new contributions. Note that plans may force out balances under $7,000 to an IRA or as a cash distribution.

### Option 4: Cash Out (Generally Not Recommended)

You can withdraw the money as cash, but this is usually the worst option. You'll owe income taxes on the entire amount, plus a 10% early withdrawal penalty if you're under 59½. You also lose the tax-advantaged growth potential.

## Direct vs. Indirect Rollovers

**Direct Rollover (Trustee-to-Trustee Transfer):** This is the preferred method. The money moves directly from your old plan to your new account without you ever taking possession of it. No taxes are withheld, and there's no risk of missing deadlines. Simply request a direct rollover from your old plan administrator, and they'll send the funds directly to your new IRA or 401(k) provider.

**Indirect Rollover (60-Day Rollover):** With this method, you receive a check for your account balance. Your old plan must withhold 20% for federal taxes. You then have 60 days to deposit the full original amount (including the 20% withheld from other sources) into a new retirement account to avoid taxes and penalties. This method is riskier—if you miss the 60-day deadline, the distribution becomes taxable and may be subject to penalties.

## Step-by-Step Rollover Process

### Step 1: Open Your New Account

If rolling to an IRA, open an account with a brokerage firm, bank, or investment company. Choose between a traditional IRA (for pre-tax 401(k) funds) or Roth IRA (if you want to convert and pay taxes now). If rolling to a new employer's plan, confirm they accept rollovers.

### Step 2: Contact Your Old Plan Administrator

Request the rollover paperwork and ask about their specific process. Some plans require forms, while others can process requests by phone. Ask how the check will be made payable and where it will be sent.

### Step 3: Complete and Submit Paperwork

Fill out all required forms. For a direct rollover, provide your new account information. Your new provider may need to send a Letter of Acceptance to your old plan.

### Step 4: Follow Up

Rollovers typically take 2-4 weeks. Follow up with both providers to ensure the transfer completes successfully. If you receive a check, deposit it promptly.

## Tax Considerations

A direct rollover from a traditional 401(k) to a traditional IRA is not a taxable event—your money remains tax-deferred. However, if you roll pre-tax 401(k) funds into a Roth IRA, this is called a Roth conversion, and the entire converted amount is added to your taxable income for that year. While you'll pay taxes now, your money can then grow tax-free and qualified withdrawals in retirement are tax-free.

## Official Resources

- IRS - Rollovers of Retirement Plan Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions
- IRS - Rollover Chart (PDF): https://www.irs.gov/pub/irs-tege/rollover_chart.pdf
- Department of Labor - What You Should Know About Your Retirement Plan: https://www.dol.gov/sites/dol.gov/files/ebsa/about-ebsa/our-activities/resource-center/publications/what-you-should-know-about-your-retirement-plan.pdf

DISCLAIMER: This article is for informational purposes only and does not constitute financial or tax advice. Consult with a qualified financial advisor or tax professional for advice specific to your situation.`
  },
  'traditional-vs-roth-ira': {
    title: 'Traditional vs. Roth IRA: Choosing the Right Rollover Destination',
    content: `# Traditional vs. Roth IRA: Choosing the Right Rollover Destination

## Understanding Your IRA Options

When rolling over your 401(k), you'll need to decide between a traditional IRA and a Roth IRA. The right choice depends on your current tax situation, expected retirement tax bracket, and long-term financial goals. Understanding the key differences can help you make an informed decision.

## Traditional IRA: Tax-Deferred Growth

A traditional IRA is funded with pre-tax dollars, meaning your contributions may be tax-deductible depending on your income and whether you have a workplace retirement plan. When you roll over a traditional 401(k) to a traditional IRA, there's no immediate tax impact—your money continues to grow tax-deferred until you withdraw it in retirement.

### Key Features of Traditional IRAs:

- Tax treatment: Contributions may be tax-deductible; withdrawals taxed as ordinary income
- Required Minimum Distributions (RMDs): Must begin taking withdrawals at age 73
- Early withdrawal penalty: 10% penalty plus income tax if withdrawn before age 59½ (exceptions apply)
- Contribution limits (2024): $7,000 ($8,000 if age 50+)
- Income limits: No income limits for contributions; deductibility may be limited if you have a workplace plan

## Roth IRA: Tax-Free Growth

A Roth IRA is funded with after-tax dollars. If you roll over a traditional 401(k) to a Roth IRA (called a Roth conversion), you'll pay income tax on the converted amount in the year of conversion. However, your money then grows tax-free, and qualified withdrawals in retirement are completely tax-free.

### Key Features of Roth IRAs:

- Tax treatment: Contributions made with after-tax dollars; qualified withdrawals are tax-free
- Required Minimum Distributions: None during the original owner's lifetime
- Early withdrawal: Contributions can be withdrawn any time tax-free; earnings may be subject to taxes/penalties
- Contribution limits (2024): $7,000 ($8,000 if age 50+)
- Income limits (2024): Phase-out begins at $146,000 (single) or $230,000 (married filing jointly)

## When to Choose a Traditional IRA

A traditional IRA may be better if:

- You expect to be in a lower tax bracket in retirement than you are now
- You want to avoid paying taxes now and defer them to retirement
- You need to preserve cash and can't afford the tax bill from a Roth conversion
- You're close to retirement and don't have enough time for tax-free growth to offset conversion taxes
- You want the option to roll the funds into a future employer's plan (note: adding personal contributions to a rollover IRA may limit this option)

## When to Choose a Roth IRA (Roth Conversion)

A Roth IRA may be better if:

- You expect to be in a higher tax bracket in retirement
- You're currently in a lower tax bracket (e.g., after job loss) and can convert at a lower rate
- You value tax-free withdrawals in retirement for flexibility
- You want to avoid RMDs and let your money grow longer
- You want to leave tax-free money to heirs
- You have decades until retirement for tax-free growth to compound

## Roth Conversion Considerations

If you convert your traditional 401(k) to a Roth IRA, the entire converted amount is added to your taxable income for that year. For example, if you convert $50,000 and you're in the 22% tax bracket, you could owe approximately $11,000 in federal taxes. Consider these strategies:

- Partial conversions: Convert a portion each year to spread out the tax impact
- Low-income years: Convert during years when your income is lower (job loss, sabbatical)
- Pay taxes separately: Ideally, pay conversion taxes from non-retirement funds to maximize growth
- Consider state taxes: Some states don't tax retirement income; factor this into your decision

## If You Have a Roth 401(k)

If your 401(k) includes a Roth 401(k) component (after-tax contributions), you can roll those funds directly into a Roth IRA tax-free since taxes have already been paid. This is a straightforward rollover with no conversion required.

## Official Resources

- IRS - Traditional and Roth IRAs: https://www.irs.gov/retirement-plans/traditional-and-roth-iras
- IRS - Roth Comparison Chart: https://www.irs.gov/retirement-plans/roth-comparison-chart
- IRS - IRA FAQs: https://www.irs.gov/retirement-plans/retirement-plans-faqs-regarding-iras

DISCLAIMER: This article is for informational purposes only and does not constitute financial or tax advice. Roth conversions have significant tax implications. Consult with a qualified financial advisor or tax professional before making conversion decisions.`
  },
  'avoid-401k-mistakes': {
    title: 'Avoid Common 401(k) Mistakes During Job Loss',
    content: `# Avoid Common 401(k) Mistakes During Job Loss

## The High Cost of 401(k) Mistakes

Losing a job is stressful enough without making costly mistakes with your retirement savings. Studies show that billions of dollars are lost each year when employees make poor decisions about their 401(k) plans during job transitions. Understanding these common pitfalls can help you protect your hard-earned retirement savings.

## Mistake #1: Cashing Out Your 401(k)

This is the most expensive mistake you can make. When you cash out instead of rolling over, you face immediate consequences:

- 20% mandatory withholding: Your employer must withhold 20% for federal taxes
- Income taxes: The entire amount is added to your taxable income
- 10% early withdrawal penalty: If you're under 59½, you owe an additional 10%
- State taxes: Most states also tax the withdrawal
- Lost growth: That money can no longer compound tax-deferred

Example: If you cash out $50,000 at age 40 in the 22% tax bracket:

- Federal tax (22%): $11,000
- Early withdrawal penalty (10%): $5,000
- State tax (5% estimate): $2,500
- Total cost: $18,500 — you only keep $31,500
- Plus, that $50,000 could grow to $270,000+ by age 65 at 7% returns

## Mistake #2: Forgetting About Your Old 401(k)

It's easy to forget about an old 401(k), especially if you've had multiple jobs. Problems with abandoned accounts include: difficulty tracking your total retirement savings, missing important communications from the plan, outdated beneficiary designations, and plans may force out small balances (under $7,000) into an IRA or as cash. Keep track of all your retirement accounts and consider consolidating them for easier management.

## Mistake #3: Not Understanding Your Vesting

Your own contributions are always 100% yours, but employer matching contributions may be subject to a vesting schedule. If you leave before fully vested, you forfeit the unvested portion of employer contributions. Before leaving a job, check your vesting schedule—waiting a few more months could mean keeping thousands more in retirement savings.

## Mistake #4: Taking an Indirect Rollover and Missing the Deadline

If you request your funds be paid to you (indirect rollover), you have exactly 60 days to deposit the money into another retirement account. Miss this deadline by even one day, and the entire amount becomes taxable income plus a 10% penalty if you're under 59½. Always request a direct rollover instead, where the money goes straight to your new account.

## Mistake #5: Not Replacing the 20% Withholding

With an indirect rollover, your old plan withholds 20% for taxes. If you don't replace that 20% from other funds when depositing into your new account, the withheld amount is treated as a taxable distribution. For example, on a $50,000 rollover, you'd receive $40,000. To complete a tax-free rollover, you must deposit $50,000—the $40,000 you received plus $10,000 from other sources.

## Mistake #6: Ignoring the Rule of 55

If you leave your job during or after the year you turn 55, you can withdraw from that employer's 401(k) without paying the 10% early withdrawal penalty. This 'Rule of 55' only applies to the 401(k) at the job you're leaving—not to IRAs or previous employers' plans. If you might need the money before 59½, consider leaving funds in the 401(k) rather than rolling to an IRA.

## Mistake #7: Not Considering Net Unrealized Appreciation (NUA)

If your 401(k) contains company stock that has appreciated significantly, rolling it into an IRA may not be the best strategy. Net Unrealized Appreciation (NUA) rules allow you to transfer company stock to a taxable brokerage account and pay capital gains rates on the appreciation instead of ordinary income rates. This can result in substantial tax savings. Consult a tax advisor if you hold significant company stock.

## Mistake #8: Rolling Into a High-Fee IRA

Not all IRAs are created equal. Some charge high fees that can significantly erode your returns over time. Before rolling over, compare fees at different IRA providers, including account maintenance fees, expense ratios on investment options, and trading commissions. Low-cost providers like Vanguard, Fidelity, and Schwab offer many low-expense index funds.

## What to Do Instead

- Request a direct rollover to avoid withholding and deadline issues
- Compare your options carefully before deciding where to move your money
- Consider fees in both your old plan and potential new accounts
- Check your vesting before leaving—a few more months could be worth thousands
- Don't rush—you usually have time to make a thoughtful decision
- Consult a financial advisor for complex situations involving large balances or company stock

## Official Resources

- IRS - Retirement Topics - Exceptions to Tax on Early Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions
- IRS - Rollovers of Retirement Plan Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions
- Department of Labor - Taking the Mystery Out of Retirement: https://www.dol.gov/general/topic/retirement/typesofplans

DISCLAIMER: This article is for informational purposes only and does not constitute financial or tax advice. Consult with a qualified financial advisor or tax professional for advice specific to your situation.`
  },
  '60-day-rollover-rule': {
    title: 'The 60-Day Rollover Rule: What You Need to Know',
    content: `# The 60-Day Rollover Rule: What You Need to Know

## Understanding the 60-Day Rule

The 60-day rollover rule is one of the most important—and most misunderstood—rules in retirement planning. When you receive a distribution from a retirement account and want to roll it over to another account, you have exactly 60 days from the date you receive the funds to complete the rollover. Miss this deadline, and you face taxes and potentially significant penalties.

The 60-day rule applies to indirect rollovers (also called 60-day rollovers), where you take possession of the funds before depositing them into another retirement account. This is different from a direct rollover, where funds move directly between financial institutions without you ever touching the money.

## How the 60-Day Rule Works

Here's a typical scenario: You leave your job and request a distribution from your 401(k). Your former employer sends you a check for your account balance (minus 20% withholding for taxes). From the day you receive that check, you have exactly 60 calendar days to deposit the full amount—including the 20% that was withheld—into another qualified retirement account. If you miss the deadline, the distribution becomes taxable income, and if you're under 59½, you'll also owe a 10% early withdrawal penalty.

## Critical Requirements

To complete a tax-free rollover within 60 days, you must:

- Deposit the full original distribution amount (not just what you received after withholding)
- Complete the deposit within 60 calendar days of receiving the funds
- Deposit into a qualified retirement account (IRA, 401(k), etc.)
- Only one indirect rollover per 12-month period per IRA

## Common Pitfalls

**Not Replacing the 20% Withholding:** If your plan withheld 20% for taxes, you must replace that amount from other funds when depositing. For example, if you received $40,000 (after $10,000 withholding), you must deposit $50,000 total to avoid taxes on the $10,000.

**Counting Days Incorrectly:** The 60 days are calendar days, not business days. Weekends and holidays count. Day 1 is the day you receive the funds.

**Multiple Rollovers:** The IRS limits you to one indirect rollover per 12-month period per IRA. This applies across all your IRAs—not per account.

**Missing Documentation:** Keep records of when you received funds and when you deposited them. You'll need this for tax reporting.

## What Happens If You Miss the Deadline

If you miss the 60-day deadline:

- The entire distribution becomes taxable income for that year
- If you're under 59½, you'll owe a 10% early withdrawal penalty
- You lose the tax-advantaged status of those funds
- The withheld amount may not be enough to cover your full tax liability

## Exceptions and Waivers

In rare circumstances, the IRS may grant a waiver of the 60-day requirement if you can show that circumstances beyond your control prevented you from completing the rollover. Examples might include serious illness, natural disasters, or errors by financial institutions. You must apply for the waiver and provide documentation.

## Best Practices

- Use direct rollovers whenever possible to avoid the 60-day rule entirely
- If you must do an indirect rollover, start early: Don't wait until day 59—unexpected problems can arise
- Have funds ready: If you need to replace withholding, have those funds available
- Keep documentation: Save records of when you received funds and when you deposited them

## Official Resources

- IRS - 60-Day Rollover Waivers FAQ: https://www.irs.gov/retirement-plans/retirement-plans-faqs-relating-to-waivers-of-the-60-day-rollover-requirement
- IRS - Rollovers of Retirement Plan Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions
- IRS - Publication 590-A (IRA Contributions): https://www.irs.gov/publications/p590a

DISCLAIMER: This article is for informational purposes only and does not constitute financial or tax advice. The 60-day rule has strict requirements. Consult with a qualified tax professional for advice specific to your situation.`
  },
  'understanding-vesting-schedules': {
    title: 'Understanding Vesting Schedules',
    content: `# Understanding Vesting Schedules

## What Is Vesting?

Vesting determines when you gain full ownership of employer-contributed funds in your retirement plan. Your own contributions are always 100% yours immediately, but employer matching contributions and profit-sharing contributions typically follow a vesting schedule. Understanding your vesting schedule is crucial when considering leaving a job, as unvested funds will be forfeited.

## Types of Vesting Schedules

### Immediate Vesting

Some employers offer immediate vesting, meaning you own 100% of employer contributions as soon as they're made. This is less common but provides the most security for employees.

### Cliff Vesting

With cliff vesting, you become 100% vested after a specific period of service. For example, you might be 0% vested for your first three years, then 100% vested on your third anniversary. If you leave before the cliff date, you forfeit all employer contributions.

### Graded Vesting

Graded vesting (also called gradual vesting) increases your ownership percentage over time. For example, you might be 20% vested after year 1, 40% after year 2, 60% after year 3, 80% after year 4, and 100% after year 5. You keep the percentage you've earned even if you leave before full vesting.

## Common Vesting Schedules

**3-Year Cliff:** 0% for years 1-2, 100% after year 3

**5-Year Cliff:** 0% for years 1-4, 100% after year 5

**6-Year Graded:** 0% year 1, 20% year 2, 40% year 3, 60% year 4, 80% year 5, 100% year 6

**7-Year Graded:** 0% year 1, 20% year 2, 40% year 3, 60% year 4, 80% year 5, 100% year 6-7

## Why Vesting Matters

If you're considering leaving a job, check your vesting schedule. Waiting just a few more months could mean keeping thousands of dollars in employer contributions. For example, if you're 80% vested and have $20,000 in employer contributions, leaving now means you keep $16,000. Waiting until you're 100% vested means you keep the full $20,000—a $4,000 difference.

## How to Check Your Vesting Status

- Review your 401(k) plan documents or summary plan description
- Check your online account portal—most plans show your vesting percentage
- Contact your plan administrator or HR department
- Review your quarterly or annual statements

## What Happens to Unvested Funds

When you leave a job before full vesting, unvested employer contributions are forfeited and returned to the plan. These funds may be used to reduce future employer contributions or pay plan expenses. You cannot recover unvested funds after leaving.

## Special Considerations

**Service Time:** Vesting is typically based on years of service, not calendar years. Check how your plan calculates service—some count partial years, others require full years.

**Plan Changes:** If your employer changes the vesting schedule, existing participants are usually grandfathered under the old schedule or given the better of the two schedules.

**Mergers and Acquisitions:** If your company is acquired, your service with the old company may count toward vesting in the new company's plan.

## Official Resources

- Department of Labor - What You Should Know About Your Retirement Plan: https://www.dol.gov/sites/dol.gov/files/ebsa/about-ebsa/our-activities/resource-center/publications/what-you-should-know-about-your-retirement-plan.pdf
- IRS - Retirement Topics - Vesting: https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-vesting

DISCLAIMER: This article is for informational purposes only and does not constitute financial or legal advice. Consult with your plan administrator or a qualified financial advisor for advice specific to your situation.`
  },
  'early-withdrawal-penalties-exceptions': {
    title: 'Early Withdrawal Penalties and Exceptions',
    content: `# Early Withdrawal Penalties and Exceptions

## Understanding Early Withdrawal Penalties

Generally, if you withdraw money from a retirement account before age 59½, you'll owe a 10% early withdrawal penalty in addition to regular income taxes. This penalty is designed to discourage people from using retirement savings for non-retirement purposes. However, there are important exceptions that may allow you to avoid the penalty in certain circumstances.

## Standard Penalty Rules

For most retirement accounts (401(k)s, IRAs, etc.), early withdrawals before age 59½ are subject to:

- Regular income tax on the withdrawn amount
- A 10% additional penalty tax
- State income taxes (in most states)

Example: If you withdraw $20,000 at age 45 in the 22% tax bracket:
- Federal income tax (22%): $4,400
- Early withdrawal penalty (10%): $2,000
- Total federal cost: $6,400
- You keep: $13,600 (plus state taxes may apply)

## Common Exceptions to the 10% Penalty

### Exception 1: Substantially Equal Periodic Payments (72(t))

You can avoid the penalty by taking "substantially equal periodic payments" based on your life expectancy. These payments must continue for at least 5 years or until you reach age 59½, whichever is longer. Once started, you generally cannot modify the payment schedule.

### Exception 2: Medical Expenses

You can withdraw penalty-free if the withdrawal is used to pay unreimbursed medical expenses that exceed 7.5% of your adjusted gross income (AGI). You'll still owe income taxes on the withdrawal.

### Exception 3: Disability

If you become permanently disabled, you can withdraw from retirement accounts penalty-free. The IRS defines disability as being unable to engage in any substantial gainful activity due to a physical or mental condition expected to result in death or last indefinitely.

### Exception 4: First-Time Home Purchase

You can withdraw up to $10,000 from an IRA penalty-free for a first-time home purchase. This exception does not apply to 401(k) plans. You'll still owe income taxes on the withdrawal.

### Exception 5: Higher Education Expenses

You can withdraw penalty-free from an IRA (not 401(k)) to pay qualified higher education expenses for yourself, your spouse, children, or grandchildren. Expenses include tuition, fees, books, supplies, and equipment.

### Exception 6: Health Insurance Premiums

If you're unemployed and receiving unemployment compensation for 12 consecutive weeks, you can withdraw from an IRA penalty-free to pay health insurance premiums for yourself, your spouse, or dependents.

### Exception 7: Birth or Adoption Expenses

You can withdraw up to $5,000 from retirement accounts penalty-free within one year of the birth or adoption of a child. This applies to each parent, so a couple could withdraw $10,000 total.

### Exception 8: Domestic Abuse

Victims of domestic abuse can withdraw up to $10,000 (or 50% of account value, whichever is less) penalty-free from retirement accounts. This exception applies within one year of the abuse.

## The Rule of 55

If you leave your job during or after the year you turn 55, you can withdraw from that employer's 401(k) without the 10% penalty. This "Rule of 55" only applies to the 401(k) at the job you're leaving—not to IRAs or previous employers' plans. You'll still owe income taxes on withdrawals.

## 401(k) vs. IRA Exceptions

Some exceptions apply only to IRAs, not 401(k)s:
- First-time home purchase
- Higher education expenses
- Health insurance premiums (while unemployed)

If you need funds for these purposes and have a 401(k), you may need to roll it to an IRA first, but be aware of the 60-day rollover rule and other considerations.

## What to Do Before Withdrawing

- Explore all alternatives: loans, hardship withdrawals, or other sources of funds
- Understand the tax impact: Calculate total taxes and penalties
- Consider partial withdrawals: Withdraw only what you need
- Consult a tax professional: Early withdrawals have complex tax implications
- Review your plan documents: Some plans have additional restrictions

## Official Resources

- IRS - Retirement Topics - Exceptions to Tax on Early Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions
- IRS - Publication 590-B (Distributions from IRAs): https://www.irs.gov/publications/p590b

DISCLAIMER: This article is for informational purposes only and does not constitute financial or tax advice. Early withdrawals have significant tax and retirement planning implications. Consult with a qualified tax professional or financial advisor before making withdrawal decisions.`
  },
  'retirement-planning-resources': {
    title: 'Retirement Planning Resources',
    content: `# Retirement Planning Resources

## Comprehensive Retirement Planning After Job Loss

Losing a job can significantly impact your retirement planning, but it doesn't have to derail your long-term financial security. Understanding your options and accessing the right resources can help you protect and grow your retirement savings during this transition.

## Key Considerations After Job Loss

When you lose your job, several retirement-related decisions need attention:

- What to do with your 401(k) from your former employer
- How to maintain retirement savings contributions
- Understanding your vesting status and what you're entitled to keep
- Planning for healthcare costs in retirement
- Adjusting your retirement timeline if needed

## Government Resources

### Internal Revenue Service (IRS)

The IRS provides comprehensive information about retirement plans, rollovers, and tax implications:

- Retirement Plans: https://www.irs.gov/retirement-plans
- Rollovers of Retirement Plan Distributions: https://www.irs.gov/retirement-plans/plan-participant-employee/rollovers-of-retirement-plan-and-ira-distributions
- Traditional and Roth IRAs: https://www.irs.gov/retirement-plans/traditional-and-roth-iras
- Retirement Topics: https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics

### Department of Labor (DOL)

The DOL's Employee Benefits Security Administration (EBSA) provides resources on retirement plan rights and protections:

- What You Should Know About Your Retirement Plan: https://www.dol.gov/sites/dol.gov/files/ebsa/about-ebsa/our-activities/resource-center/publications/what-you-should-know-about-your-retirement-plan.pdf
- Taking the Mystery Out of Retirement Planning: https://www.dol.gov/general/topic/retirement/typesofplans
- Retirement Savings Toolkit: https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/retirement-savings-toolkit

## Professional Resources

### Financial Advisors

Consider consulting a qualified financial advisor, especially if you have:
- Large account balances ($100,000+)
- Complex situations (company stock, multiple accounts)
- Questions about tax strategies
- Need for comprehensive financial planning

Look for advisors who are:
- Fiduciaries (legally required to act in your best interest)
- Fee-only (not commission-based)
- Certified Financial Planners (CFP) or Chartered Financial Analysts (CFA)

### Tax Professionals

A qualified tax professional can help with:
- Understanding tax implications of rollovers and withdrawals
- Planning Roth conversions
- Navigating early withdrawal exceptions
- Optimizing tax strategies during job loss

## Online Tools and Calculators

### Retirement Calculators

- Social Security Administration: https://www.ssa.gov/benefits/retirement/estimator.html
- AARP Retirement Calculator: https://www.aarp.org/retirement/retirement-calculator/
- Bankrate Retirement Calculator: https://www.bankrate.com/retirement/retirement-plan-calculator/

### Rollover Tools

Many financial institutions offer online rollover tools and guides:
- Fidelity Rollover Center: https://www.fidelity.com/retirement-ira/401k-rollover
- Vanguard Rollover Guide: https://investor.vanguard.com/401k-rollover
- Charles Schwab Rollover Services: https://www.schwab.com/ira/401k-rollover

## Educational Resources

### Understanding Your Options

Before making decisions about your retirement savings, educate yourself on:
- Direct vs. indirect rollovers
- Traditional vs. Roth IRAs
- Vesting schedules
- Early withdrawal penalties and exceptions
- Required Minimum Distributions (RMDs)

### Staying Informed

Retirement planning rules and limits change regularly. Stay informed by:
- Reviewing IRS updates annually
- Checking contribution limits each year
- Understanding changes to RMD rules
- Monitoring your accounts regularly

## Common Mistakes to Avoid

- Cashing out your 401(k) instead of rolling it over
- Missing the 60-day rollover deadline
- Not understanding your vesting schedule
- Rolling into high-fee accounts
- Taking early withdrawals without exploring exceptions
- Not considering tax implications

## When to Seek Professional Help

Consider professional guidance if you:
- Have account balances over $100,000
- Hold company stock in your 401(k)
- Are considering a Roth conversion
- Need to take early withdrawals
- Have multiple retirement accounts to consolidate
- Are unsure about tax implications

## Official Resources

- IRS - Retirement Plans: https://www.irs.gov/retirement-plans
- Department of Labor - Retirement Plans: https://www.dol.gov/general/topic/retirement
- Social Security Administration: https://www.ssa.gov

DISCLAIMER: This article is for informational purposes only and does not constitute financial, tax, or legal advice. Retirement planning decisions have significant long-term implications. Consult with qualified financial, tax, and legal professionals for advice specific to your situation.`
  },
  'warn-act-rights': {
    title: 'WARN Act Rights: Your Right to Advance Notice of Layoffs',
    content: `# WARN Act Rights: Your Right to Advance Notice of Layoffs

## What Is the WARN Act?

The Worker Adjustment and Retraining Notification (WARN) Act is a federal law that requires employers to provide 60 days advance written notice before plant closings and mass layoffs. The law is designed to give workers and their families time to prepare for job loss, seek new employment, and access retraining programs.

If your employer failed to give proper notice, you may be entitled to back pay and benefits for up to 60 days. The WARN Act is enforced through private lawsuits in federal court—the Department of Labor does not enforce it directly.

## Self-Assessment: Am I Covered by WARN?

Answer these questions to determine if you may have WARN Act rights:

- Employer size: Does your employer have 100 or more full-time employees (or 100+ employees who work at least 4,000 hours per week combined)?
- Mass layoff: Were 50 or more employees laid off at your site within a 30-day period AND did those employees make up at least 33% of the workforce? OR were 500+ employees laid off?
- Plant closing: Did your employer shut down a facility or operating unit resulting in 50 or more employees losing their jobs within a 30-day period?
- Notice: Did you receive less than 60 days written notice before the layoff or closing?
- Employment status: Had you worked for at least 6 months in the prior 12 months, AND did you average at least 20 hours per week?

If you answered YES to the employer size question, YES to either the mass layoff OR plant closing question, YES to the notice question, AND YES to employment status—you may have WARN Act rights.

## Key WARN Act Requirements

### Who Must Provide Notice:

Private employers with 100+ full-time employees (not counting those with less than 6 months tenure or who work less than 20 hours/week). Public and quasi-public employers in commercial operations are also covered.

## What Triggers Notice:

- Plant Closing: Shutdown of a site or unit resulting in 50+ job losses in 30 days
- Mass Layoff: 50-499 employees (if 33%+ of workforce) OR 500+ employees at one site
- Rolling layoffs: Layoffs over 90 days that together reach thresholds may also trigger WARN

## Who Must Receive Notice:

- Affected employees or their union representatives
- State dislocated worker unit (Rapid Response)
- Chief elected local official (mayor, etc.)

## Exceptions to the 60-Day Requirement

Employers may give less than 60 days notice if they can prove one of these exceptions applied:

- **Faltering Company:** The employer was actively seeking capital and giving notice would have prevented getting the funding needed to avoid the layoff
- **Unforeseeable Business Circumstances:** A sudden, dramatic, unexpected event beyond the employer's control (e.g., loss of major contract, unexpected economic downturn)
- **Natural Disaster:** The closing or layoff is a direct result of a flood, earthquake, drought, storm, or other natural disaster

Even when exceptions apply, employers must give as much notice as practicable and explain why the full 60 days wasn't possible.

## Remedies for WARN Violations

If your employer violated WARN, you may be entitled to:

- **Back pay:** Up to 60 days of wages and benefits for each day of violation
- **Benefits:** Medical expenses that would have been covered during the notice period
- **Civil penalties:** Employers may owe up to $500/day to local government if notice wasn't given

Amounts may be reduced by wages paid during the violation period, voluntary payments, or if you found other employment during the 60 days.

## State WARN Laws May Provide More Protection

Several states have their own WARN laws with stricter requirements:

- California: 75+ employees, covers part-timers, 50+ affected workers (no 33% threshold)
- New York: 50+ employees, 25+ affected workers, 90 days notice required
- New Jersey: 100+ employees, 50+ affected workers, 90 days notice, severance required
- Illinois, Maine, Tennessee, Wisconsin: Have additional requirements

Check your state's Department of Labor for specific requirements.

## What to Do If You Believe WARN Was Violated

1. Document everything: Save termination notices, emails, and any written communications
2. Note the timeline: When you received notice vs. when you were terminated
3. Contact your state's Rapid Response unit: They track WARN notices and can confirm if one was filed
4. Consult an employment attorney: WARN cases are filed in federal court; many attorneys take these on contingency
5. Act quickly: There are statutes of limitation for filing WARN claims

## Official Resources

- U.S. Department of Labor - WARN Fact Sheet: https://www.dol.gov/agencies/eta/layoffs/warn
- WARN Act Full Text (29 U.S.C. § 2101-2109): https://www.law.cornell.edu/uscode/text/29/chapter-23
- State Dislocated Worker Units: https://www.careeronestop.org/LocalHelp/service-locator.aspx
- State WARN Notice Databases (varies by state): Search '[Your State] WARN notices'

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. WARN Act cases can be complex. Consult with a qualified employment attorney to evaluate your specific situation and potential claims.`
  },
  'eeoc-discrimination-guide': {
    title: 'Filing an EEOC Discrimination Complaint',
    content: `# Filing an EEOC Discrimination Complaint

## What Is the EEOC?

The U.S. Equal Employment Opportunity Commission (EEOC) is the federal agency that enforces laws prohibiting employment discrimination. If you believe your termination, demotion, or other adverse employment action was based on illegal discrimination, you can file a Charge of Discrimination with the EEOC.

The EEOC handles complaints against private employers with 15 or more employees (20+ for age discrimination), as well as labor unions, employment agencies, and state/local governments.

## Self-Assessment: Was I Discriminated Against?

Consider whether any of these protected characteristics played a role in your termination:

- Race or Color: Were you treated differently because of your race, skin color, or racial characteristics?
- National Origin: Were you treated differently because of where you're from, your accent, ethnicity, or ancestry?
- Sex/Gender: Were you treated differently because of your sex, pregnancy, gender identity, or sexual orientation?
- Religion: Were you treated differently because of your religious beliefs or practices?
- Age (40+): If you're 40 or older, were you replaced by or treated worse than younger workers?
- Disability: Do you have a disability, and were you denied reasonable accommodation or treated worse because of it?
- Genetic Information: Was a decision made based on your family medical history or genetic tests?
- Retaliation: Were you punished for complaining about discrimination, filing a complaint, or participating in an investigation?

## Additional Questions to Consider:

- Were employees outside your protected class treated more favorably in similar situations?
- Did your employer give a reason for the action that doesn't seem true or consistent?
- Did the adverse action happen shortly after your employer learned about your protected characteristic?
- Were discriminatory comments made about your protected characteristic?
- Is there a pattern of your employer treating people in your protected class worse?

If you answered YES to multiple questions above, you may have grounds for a discrimination complaint.

## Filing Deadlines - Act Quickly!

Time limits are strict and cannot be extended:

- 180 days from the discriminatory act in states without a state anti-discrimination agency
- 300 days from the discriminatory act in states WITH a state anti-discrimination agency
- Age discrimination: 300 days only if your state has an age discrimination law
- Federal employees: Must contact EEO counselor within 45 days

The clock starts when the discriminatory action occurs and is communicated to you—not when you learn it was discriminatory. File as soon as possible.

## How to File an EEOC Charge

### Step 1: Submit an Online Inquiry

Go to the EEOC Public Portal (publicportal.eeoc.gov) and answer preliminary questions to determine if the EEOC can help with your situation.

### Step 2: Interview with EEOC Staff

An EEOC staff member will interview you (in person, by phone, or video) to understand your complaint and help determine if filing a charge is appropriate.

### Step 3: File the Formal Charge

If you decide to proceed, you'll complete the formal Charge of Discrimination through the portal.

### Step 4: Employer Notification

The EEOC notifies your employer within 10 days that a charge has been filed. Your employer cannot legally retaliate against you for filing.

## What Happens After You File

- Mediation: The EEOC may offer voluntary mediation to resolve the dispute
- Investigation: If no mediation or settlement, EEOC investigates your charge
- Determination: EEOC issues either a 'Letter of Determination' (finding discrimination) or a 'Dismissal and Notice of Rights' (no finding)
- Conciliation: If discrimination is found, EEOC tries to negotiate a settlement
- Litigation: EEOC may file suit, or you receive a 'Right to Sue' letter allowing you to file your own lawsuit within 90 days

## What You May Recover

Depending on the type of discrimination, remedies may include:

- Back pay: Lost wages from termination to resolution
- Front pay: Future lost wages if reinstatement isn't practical
- Reinstatement: Getting your job back
- Compensatory damages: Pain, suffering, emotional distress (capped based on employer size)
- Punitive damages: To punish intentional discrimination (capped)
- Attorney's fees: If you prevail
- Policy changes: Requiring employer to change discriminatory practices

## Tips for a Stronger Case

- Document everything: Save emails, texts, performance reviews, and notes about incidents
- Identify witnesses: Note names of people who saw or heard discriminatory treatment
- Get your personnel file: Request copies of your employment records
- Keep a timeline: Create a chronological record of events
- Preserve evidence: Screenshot messages, save documents outside of work systems
- Note comparators: Identify how similarly situated employees outside your protected class were treated

## Official Resources

- EEOC Public Portal: https://publicportal.eeoc.gov
- How to File a Charge: https://www.eeoc.gov/how-file-charge-employment-discrimination
- Find Your Local EEOC Office: https://www.eeoc.gov/field-office
- EEOC Phone: 1-800-669-4000 (TTY: 1-800-669-6820)
- State Fair Employment Agencies: https://www.eeoc.gov/state-and-local-agencies

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Discrimination cases are fact-specific and complex. Consider consulting with an employment attorney to evaluate your specific situation.`
  },
  'nlrb-protected-activity': {
    title: 'NLRB Protections: Your Right to Discuss Working Conditions',
    content: `# NLRB Protections: Your Right to Discuss Working Conditions

## What Is Protected Concerted Activity?

Under Section 7 of the National Labor Relations Act (NLRA), employees have the right to engage in 'concerted activity' for mutual aid or protection—even if you don't have a union. This means you can discuss wages, working conditions, and other workplace issues with coworkers without fear of retaliation.

Your employer cannot fire, discipline, threaten, or retaliate against you for engaging in protected concerted activity. If they do, you can file an Unfair Labor Practice (ULP) charge with the National Labor Relations Board (NLRB).

## Self-Assessment: Was My Activity Protected?

Your activity is likely protected if:

- Two or more employees involved: Did you act together with at least one other employee, OR were you acting on behalf of other employees, OR were you trying to get group action started?
- Work-related topic: Was the discussion about wages, hours, safety, workload, scheduling, benefits, or other terms and conditions of employment?
- Mutual benefit: Would the outcome potentially benefit you AND other employees, not just you personally?
- Not disruptive or violent: Was your activity conducted without violence, property destruction, or serious disruption to operations?

If you answered YES to all of these, your activity was likely protected.

Examples of Protected Activity:

- Discussing your pay with coworkers
- Asking coworkers what they earn
- Circulating a petition about working conditions
- Complaining as a group to management about safety issues
- Posting on social media about workplace conditions (if coworkers can see/engage)
- Refusing as a group to work in unsafe conditions
- Contacting government agencies about workplace problems
- Talking to media about workplace issues
- Organizing a union or discussing union representation

## Examples of Activity That Is NOT Protected:

- Personal gripes that don't involve or benefit other workers
- Spreading lies about your employer
- Disclosing trade secrets or confidential business information
- Violence or threats of violence
- Destroying company property
- Work slowdowns not related to safety

## Pay Secrecy Rules Are Illegal

If your employer has a policy prohibiting employees from discussing their pay, that policy is likely illegal. Employees have a protected right to discuss wages with each other. Employers cannot:

- Prohibit discussions about pay
- Fire or discipline employees for discussing wages
- Require employees to keep their pay confidential
- Threaten employees who discuss compensation

Studies show that nearly half of U.S. workers have been discouraged or prohibited from discussing pay—this is a widespread violation of federal law.

## Who Is Covered?

### Covered by NLRA:

- Most private-sector employees
- Both union and non-union workers

### NOT Covered by NLRA:

- Federal, state, and local government employees
- Agricultural workers
- Domestic workers in private homes
- Independent contractors (truly independent, not misclassified)
- Supervisors and managers
- Railroad and airline workers (covered by Railway Labor Act instead)

## Filing an Unfair Labor Practice Charge

Deadline: You must file within 6 months of the unfair labor practice.

## How to file:

1. Go to the NLRB website and locate your regional office
2. Complete NLRB Form 501 (Charge Against Employer)
3. Submit online, by mail, fax, or in person
4. The NLRB will investigate your charge

## Remedies may include:

- Reinstatement to your job
- Back pay with interest
- Notice posting informing employees of their rights
- Order requiring employer to stop illegal practices

## Social Media and Protected Activity

The NLRB has ruled that discussing working conditions on social media can be protected concerted activity if:

- The post relates to wages, hours, or working conditions
- Other employees can see and engage with the post
- The post doesn't contain serious threats, lie, or reveal trade secrets

However, isolated personal complaints or vulgar attacks on customers may not be protected.

## Official Resources

- NLRB - Concerted Activity: https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law/employees/concerted-activity
- File an Unfair Labor Practice Charge: https://www.nlrb.gov/about-nlrb/what-we-do/investigate-charges
- Find Your NLRB Regional Office: https://www.nlrb.gov/about-nlrb/who-we-are/regional-offices
- NLRB Phone: 1-866-667-NLRB (6572)
- Employee Rights Poster: https://www.nlrb.gov/sites/default/files/attachments/basic-page/node-3788/employee_rights_fnl.pdf

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. The scope of protected concerted activity can be complex. Consult with a labor attorney or your NLRB regional office for guidance on your specific situation.`
  },
  'state-labor-offices-wage-claims': {
    title: 'State Labor Offices: Filing Wage Claims and Complaints',
    content: `# State Labor Offices: Filing Wage Claims and Complaints

## What State Labor Offices Do

Every state has a Department of Labor (or equivalent agency) that handles workplace complaints and enforces state labor laws. These agencies can help you recover unpaid wages, address workplace safety issues, and resolve disputes with your employer—often without needing a lawyer.

State labor offices typically handle: unpaid wages and overtime, minimum wage violations, final paycheck issues, illegal deductions, meal and rest break violations, and workplace safety concerns.

## Self-Assessment: Do I Have a Wage Claim?

You may have a valid wage claim if any of the following apply:

- Unpaid regular wages: Your employer didn't pay you for all hours worked
- Unpaid overtime: You worked over 40 hours/week and weren't paid time-and-a-half
- Final paycheck: Your employer didn't give you your final paycheck on time or in full
- Illegal deductions: Money was taken from your pay without your authorization or in violation of law
- Minimum wage violation: You were paid less than the federal or state minimum wage
- Misclassification: You were treated as an independent contractor but should have been an employee
- Meal/rest breaks: Your employer didn't provide required meal or rest breaks (varies by state)

If any of these apply, you may be able to file a wage claim with your state labor office.

## How to File a Wage Claim

### Step 1: Gather Your Documents

Before filing, collect:
- Pay stubs and wage statements
- Time records or timesheets
- Employment contract or offer letter
- Emails or texts about your pay
- Bank statements showing deposits
- Any written agreements about compensation

### Step 2: Find Your State Labor Office

Each state has its own Department of Labor or equivalent agency. Search for "[Your State] Department of Labor" or "[Your State] Wage and Hour Division" online. The U.S. Department of Labor maintains a directory of state contacts.

### Step 3: File Your Claim

Most states allow you to file:
- Online through a portal (fastest method)
- By mail using a claim form
- In person at a local office
- By phone in some states

You'll typically need to provide:
- Your name, address, and contact information
- Your employer's name, address, and contact information
- Dates of employment
- Description of the wage violation
- Amount of wages you believe you're owed
- Supporting documentation

### Step 4: The Investigation Process

After you file:
- Initial review: The agency determines if your claim has merit and falls under their jurisdiction
- Investigation: An investigator may contact your employer, request payroll records, interview witnesses, and review documentation
- Resolution: The agency may order your employer to pay, dismiss the claim if no violation is found, or refer the case for further action

## Time Limits - Act Quickly!

Each state has different deadlines for filing wage claims, typically:
- 1-3 years from when wages were due (varies significantly by state)
- Some states have shorter limits (6 months to 1 year)
- Some allow longer periods for willful violations
- Missing the deadline can completely bar your claim

Check your state's specific deadline immediately—time limits are strict and cannot be extended.

## What You Can Recover

If your claim is successful, you may be entitled to:
- Unpaid wages
- Unpaid overtime
- Interest on unpaid wages
- Liquidated damages (double damages in some cases)
- Attorney's fees (in some states)
- Penalties for late payment

## Alternative Options

If your state agency can't help, you have other options:

- Small claims court: For smaller amounts (limits vary by state, usually $5,000-$10,000)
- Private lawsuit: Especially for larger claims or class actions
- Attorney consultation: Many employment attorneys offer free consultations

## Official Resources

- U.S. DOL - State Labor Offices: https://www.dol.gov/agencies/whd/state/contacts
- U.S. DOL - Wage and Hour Division: https://www.dol.gov/agencies/whd
- Workers Owed Wages: https://www.dol.gov/agencies/whd/wow
- Worker.gov - Filing Wage Claims: https://www.worker.gov/
- State Minimum Wages: https://www.dol.gov/agencies/whd/minimum-wage/state

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Wage claim procedures and deadlines vary significantly by state. Contact your state labor agency for specific requirements.`
  },
  'finding-free-legal-help': {
    title: 'Finding Free Legal Help',
    content: `# Finding Free Legal Help

## When You Need Legal Assistance

After a layoff, you may need legal help for:
- Reviewing severance agreements
- Understanding your rights under employment laws
- Filing discrimination or wage claims
- Appealing unemployment denials
- Negotiating severance packages
- Understanding non-compete agreements

Legal help can be expensive, but there are resources available for free or low-cost assistance.

## Legal Services Corporation (LSC)

The Legal Services Corporation funds legal aid organizations across the country that provide free legal help to low-income individuals.

**Eligibility:** Generally based on income (typically 125% of the federal poverty level or below)

**Services:** May include help with employment issues, unemployment appeals, and contract review

**How to Find:** Visit https://www.lsc.gov/find-legal-aid to find legal aid organizations in your area

## State Bar Associations

Many state bar associations offer:

**Lawyer Referral Services:** Connect you with attorneys who offer reduced-fee consultations

**Pro Bono Programs:** Match you with attorneys who provide free services

**Legal Clinics:** Offer free legal advice on specific days or topics

**Self-Help Resources:** Provide forms, guides, and information for representing yourself

## Law School Clinics

Many law schools operate legal clinics where law students, supervised by licensed attorneys, provide free legal services.

**Types of Clinics:** Employment law clinics, workers' rights clinics, unemployment clinics

**Eligibility:** Varies by clinic, but often based on income or type of case

**How to Find:** Contact law schools in your area to ask about their clinics

## Nonprofit Organizations

Various nonprofit organizations provide free legal help:

**Workers' Rights Organizations:** Focus on employment and labor law issues

**Civil Rights Organizations:** Help with discrimination cases

**Community Legal Services:** Provide general legal assistance

**Unemployment Advocacy Groups:** Help with unemployment appeals

## Pro Bono Programs

Many law firms and bar associations have pro bono programs that provide free legal services to qualifying individuals.

**Eligibility:** Typically based on income and type of case

**How to Apply:** Contact your local bar association or search for pro bono programs in your area

## Online Legal Resources

**Legal Aid Websites:** Many legal aid organizations provide online resources, forms, and self-help guides

**Court Self-Help Centers:** Many courts offer self-help resources and forms online

**Government Websites:** State and federal agencies provide information about your rights and how to file claims

## What to Bring to a Consultation

When seeking legal help, bring:

- Your severance agreement (if applicable)
- Employment contract or offer letter
- Pay stubs and wage records
- Documentation of the layoff
- Any correspondence with your employer
- Notes about your situation

## Questions to Ask

When meeting with a legal aid attorney or pro bono lawyer:

- What are my rights in this situation?
- What are my options?
- What are the time limits for taking action?
- What documents do I need?
- What are the potential outcomes?
- What are the costs (if any)?

## When to Consider Paying for an Attorney

While free legal help is valuable, consider paying for an attorney if:

- Your case is complex
- Significant money is at stake
- You need immediate action
- Free legal aid is not available in your area
- You need specialized expertise

Many employment attorneys offer free initial consultations and may work on a contingency basis (taking a percentage of any recovery) or reduced-fee arrangements.

## Official Resources

- Legal Services Corporation: https://www.lsc.gov/find-legal-aid
- American Bar Association - Free Legal Answers: https://www.americanbar.org/groups/legal_services/flh-home/
- State Bar Associations: Search for "[Your State] State Bar Association"

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Legal aid eligibility and services vary by location and organization. Consult with qualified legal professionals for advice specific to your situation.`
  },
  'whistleblower-protections': {
    title: 'Whistleblower Protections',
    content: `# Whistleblower Protections

## What Is Whistleblowing?

Whistleblowing occurs when an employee reports illegal, unsafe, or unethical activities by their employer. Federal and state laws protect whistleblowers from retaliation for reporting certain types of violations.

## Protected Whistleblowing Activities

You are generally protected when you report:

**Safety Violations:** Reporting workplace safety hazards or violations of OSHA regulations

**Financial Fraud:** Reporting securities fraud, accounting fraud, or other financial crimes

**Environmental Violations:** Reporting violations of environmental laws

**Public Health Violations:** Reporting violations that affect public health or safety

**Illegal Activities:** Reporting violations of laws, rules, or regulations

**Waste or Abuse:** Reporting gross waste, mismanagement, or abuse of authority (for government employees)

## Federal Whistleblower Laws

**OSHA Whistleblower Protection:** Protects workers who report safety violations or file complaints about workplace safety

**Sarbanes-Oxley Act:** Protects employees of publicly traded companies who report fraud

**Dodd-Frank Act:** Provides protections and potential rewards for reporting securities violations

**False Claims Act:** Protects employees who report fraud against the government and may provide financial rewards

**Various Industry-Specific Laws:** Many industries have specific whistleblower protections (aviation, nuclear, transportation, etc.)

## State Whistleblower Laws

Many states have their own whistleblower protection laws that may:

- Cover additional types of violations
- Apply to private employers (not just government)
- Provide different remedies
- Have different procedures

Check your state's laws to understand your specific protections.

## What Constitutes Retaliation?

It is illegal for an employer to retaliate against you for protected whistleblowing. Retaliation may include:

- Termination or layoff
- Demotion or reduction in pay
- Denial of promotion or benefits
- Negative performance evaluations
- Harassment or hostile work environment
- Threats or intimidation
- Blacklisting

## How to Report Safely

**Document Everything:** Keep detailed records of:
- What you observed or reported
- When you reported it
- Who you reported it to
- Any response you received
- Any retaliation you experienced

**Report to Appropriate Authorities:**
- Government agencies (OSHA, SEC, EPA, etc.)
- Internal compliance hotlines (if available and trustworthy)
- Law enforcement (for criminal activity)

**Follow Proper Channels:** Use official reporting mechanisms when available

**Consider Anonymity:** Some reporting systems allow anonymous reporting

## Filing a Whistleblower Complaint

**Time Limits:** Vary by law but are typically:
- 30-180 days from the retaliation
- Some laws have longer time limits
- Missing deadlines can bar your claim

**Where to File:**
- OSHA (for safety-related complaints)
- SEC (for securities violations)
- Appropriate federal or state agency
- Federal or state court (in some cases)

**What to Include:**
- Description of the violation you reported
- When and how you reported it
- Description of the retaliation
- Supporting documentation

## Remedies Available

If you prevail in a whistleblower case, you may be entitled to:

- Reinstatement to your position
- Back pay and benefits
- Front pay (future lost wages)
- Compensatory damages
- Punitive damages (in some cases)
- Attorney's fees and costs
- Financial rewards (under some laws like the False Claims Act)

## Confidentiality Protections

Many whistleblower laws include confidentiality protections:

- Your identity may be protected during investigations
- Employers may be prohibited from disclosing your identity
- You may be protected from defamation claims

## Official Resources

- OSHA - Whistleblower Protection: https://www.whistleblowers.gov
- SEC - Office of the Whistleblower: https://www.sec.gov/whistleblower
- U.S. Department of Labor - Whistleblower Programs: https://www.dol.gov/agencies/whd/whistleblower

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Whistleblower protections vary by law and jurisdiction. Consult with a qualified attorney specializing in whistleblower law for advice specific to your situation.`
  },
  'documenting-workplace-issues': {
    title: 'Documenting Workplace Issues',
    content: `# Documenting Workplace Issues

## Why Documentation Matters

Proper documentation is crucial when dealing with workplace issues, discrimination, retaliation, or potential legal claims. Good documentation can:
- Support your claims in legal proceedings
- Help you remember important details
- Provide evidence of patterns of behavior
- Strengthen your position in negotiations
- Help others understand your situation

## What to Document

**Incidents:** Record details of each incident, including:
- Date and time
- Location
- Who was involved
- What was said or done
- Who witnessed it
- How it made you feel
- Any physical evidence

**Communications:** Keep records of:
- Emails and text messages
- Written correspondence
- Meeting notes
- Performance reviews
- Disciplinary actions
- Promises or commitments made

**Patterns:** Document:
- Frequency of incidents
- Escalation over time
- Similar treatment of others
- Changes in your treatment after reporting

## How to Document

**Written Journal:** Keep a detailed, dated journal of incidents. Write entries as soon as possible after events occur.

**Emails to Yourself:** Send yourself emails documenting incidents. This creates a timestamped record.

**Save Documents:** Keep copies of all relevant documents:
- Employment contracts
- Employee handbooks
- Performance reviews
- Disciplinary notices
- Pay stubs
- Company policies

**Photographs:** Take photos of:
- Physical evidence
- Workplace conditions
- Injuries
- Written notices or postings

**Witness Information:** Record:
- Names of witnesses
- Their contact information
- What they observed
- Their willingness to testify

## Best Practices

**Be Accurate:** Only document facts, not speculation or assumptions

**Be Timely:** Document incidents as soon as possible while details are fresh

**Be Detailed:** Include specific dates, times, locations, and exact words when possible

**Be Consistent:** Use the same format and level of detail throughout

**Be Secure:** Keep your documentation in a safe place, separate from work

**Be Objective:** Stick to facts rather than emotional language (though you can note your emotional response)

## What NOT to Document at Work

**Avoid Company Systems:** Don't store sensitive documentation on company computers, email, or cloud storage

**Avoid Work Devices:** Don't use company-issued devices for personal documentation

**Avoid Work Time:** Be careful about when and where you document (don't do it during work hours if it violates company policy)

## Organizing Your Documentation

**Chronological Order:** Organize documents by date

**By Topic:** Group related documents together (discrimination, wage issues, etc.)

**Multiple Copies:** Keep copies in different secure locations

**Digital Backups:** Scan and backup important physical documents

## Using Documentation

**Legal Proceedings:** Your documentation may be used as evidence in:
- EEOC charges
- Lawsuits
- Unemployment appeals
- Wage claims
- Arbitration proceedings

**Negotiations:** Documentation can strengthen your position when:
- Negotiating severance
- Discussing issues with HR
- Filing complaints

**Memory Aid:** Detailed documentation helps you remember events accurately, especially months or years later

## Privacy Considerations

**Confidentiality:** Be mindful of:
- Privacy rights of others mentioned in your documentation
- Confidentiality agreements you may have signed
- Attorney-client privilege (if working with an attorney)

**Storage:** Keep documentation secure and private:
- Use password protection for digital files
- Store physical documents in a safe place
- Consider using encrypted storage

## When to Consult an Attorney

Consider consulting an attorney if:
- You're documenting serious legal violations
- You're planning to file a legal claim
- You're concerned about retaliation
- You need advice on what to document
- You're unsure about confidentiality issues

## Official Resources

- EEOC - Filing a Charge: https://www.eeoc.gov/filing-charge-discrimination
- U.S. Department of Labor - Document Retention: https://www.dol.gov/general/topic/workhours/recordkeeping

DISCLAIMER: This article is for informational purposes only and does not constitute legal advice. Documentation requirements and best practices may vary by situation and jurisdiction. Consult with a qualified employment attorney for advice specific to your situation.`
  }
};

export const SeveranceArticleView: React.FC<SeveranceArticleViewProps> = ({ articleId, onBack }) => {
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, boolean>>({});
  const article = articleId ? ARTICLE_CONTENT[articleId] : undefined;

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          ← Back to LaidOff
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Article Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400">The requested article could not be found.</p>
        </div>
      </div>
    );
  }

  // Simple markdown-like rendering
  // Helper function to process text with bold, links, and formatting
  const processText = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    // Process URLs first
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatches = Array.from(remaining.matchAll(urlRegex));
    
    if (urlMatches.length > 0) {
      let lastIndex = 0;
      urlMatches.forEach((match) => {
        if (match.index !== undefined) {
          // Add text before URL
          if (match.index > lastIndex) {
            const beforeText = remaining.substring(lastIndex, match.index);
            parts.push(...processBoldAndFormatting(beforeText, key));
            key += beforeText.length;
          }
          // Add URL as link
          const url = match[0];
          parts.push(
            <a
              key={`link-${key++}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
            >
              {url}
            </a>
          );
          lastIndex = match.index + match[0].length;
        }
      });
      // Add remaining text
      if (lastIndex < remaining.length) {
        const afterText = remaining.substring(lastIndex);
        parts.push(...processBoldAndFormatting(afterText, key));
      }
    } else {
      // No URLs, just process bold and formatting
      parts.push(...processBoldAndFormatting(remaining, key));
    }

    return parts;
  };

  // Helper to process bold text and other formatting
  const processBoldAndFormatting = (text: string, startKey: number): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let key = startKey;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index !== undefined) {
        // Add text before bold
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          // Check for numbers and important terms
          parts.push(processNumbersAndTerms(beforeText, key));
          key += beforeText.length;
        }
        // Add bold text
        parts.push(
          <strong key={`bold-${key++}`} className="font-black text-slate-900 dark:text-white">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }
    }
    // Add remaining text
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      parts.push(processNumbersAndTerms(afterText, key));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Helper to highlight numbers and important terms
  const processNumbersAndTerms = (text: string, startKey: number): string | JSX.Element => {
    // Highlight dollar amounts, percentages, and ages
    const numberRegex = /(\$[\d,]+|\d+%|\d+½|age \d+|under \d+)/gi;
    const matches = Array.from(text.matchAll(numberRegex));
    
    if (matches.length === 0) return text;

    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let key = startKey;

    matches.forEach((match) => {
      if (match.index !== undefined) {
        // Add text before number
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        // Add highlighted number
        parts.push(
          <span key={`num-${key++}`} className="font-black text-emerald-600 dark:text-emerald-400">
            {match[0]}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }
    });
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    let firstH1Skipped = false;
    let inResourcesSection = false;
    let resourcesItems: string[] = [];
    let inSelfAssessment = false;
    let assessmentQuestions: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        elements.push(
          <p key={`p-${elements.length}`} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
            {processText(paragraphText)}
          </p>
        );
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="mb-4 ml-6 list-disc space-y-2 text-slate-700 dark:text-slate-300">
            {listItems.map((item, idx) => {
              const cleanItem = item.replace(/^[-*]\s*/, '');
              return (
                <li key={idx} className="leading-relaxed">
                  {processText(cleanItem)}
                </li>
              );
            })}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushResources = () => {
      if (resourcesItems.length > 0) {
        elements.push(
          <div key={`resources-${elements.length}`} className="mt-12 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              Official Resources
            </h3>
            <ul className="space-y-3">
              {resourcesItems.map((item, idx) => {
                const urlMatch = item.match(/(https?:\/\/[^\s]+)/);
                const textBeforeUrl = urlMatch ? item.substring(0, item.indexOf(urlMatch[0])).replace(/^-\s*/, '').trim() : item.replace(/^-\s*/, '').trim();
                const url = urlMatch ? urlMatch[0] : null;
                
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                    <div className="flex-1">
                      {textBeforeUrl && (
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{textBeforeUrl}: </span>
                      )}
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium break-all"
                        >
                          {url}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
        resourcesItems = [];
        inResourcesSection = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        // Skip the first H1 since we already display the title above
        if (!firstH1Skipped) {
          firstH1Skipped = true;
          return;
        }
        flushParagraph();
        flushList();
        flushResources();
        elements.push(
          <h1 key={`h1-${idx}`} className="text-3xl font-black text-slate-900 dark:text-white mb-6 mt-8 first:mt-0">
            {trimmed.substring(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushParagraph();
        flushList();
        const headingText = trimmed.substring(3);
        if (headingText === 'Official Resources') {
          flushResources();
          inResourcesSection = true;
          return; // Don't render the heading, we'll render it in flushResources
        }
        if (headingText.includes('Self-Assessment') || headingText.includes('Self Assessment')) {
          flushResources();
          inSelfAssessment = true;
          assessmentQuestions = [];
          elements.push(
            <h2 key={`h2-${idx}`} className="text-2xl font-black text-slate-900 dark:text-white mb-4 mt-6">
              {headingText}
            </h2>
          );
          return;
        }
        if (inSelfAssessment && !headingText.includes('Self-Assessment') && !headingText.includes('Self Assessment')) {
          // Flush assessment and exit assessment mode
          if (assessmentQuestions.length > 0) {
            elements.push(
              <div key={`assessment-${idx}`} className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl">
                <div className="space-y-3">
                  {assessmentQuestions.map((question, qIdx) => {
                    const questionId = `assessment-${articleId}-${idx}-${qIdx}`;
                    const isChecked = assessmentAnswers[questionId] || false;
                    return (
                      <label key={qIdx} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setAssessmentAnswers(prev => ({ ...prev, [questionId]: e.target.checked }))}
                          className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium">{processText(question.replace(/^[-*]\s*/, ''))}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
            assessmentQuestions = [];
          }
          inSelfAssessment = false;
        }
        flushResources();
        elements.push(
          <h2 key={`h2-${idx}`} className="text-2xl font-black text-slate-900 dark:text-white mb-4 mt-6">
            {headingText}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushParagraph();
        flushList();
        flushResources();
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xl font-black text-slate-900 dark:text-white mb-3 mt-5">
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushParagraph();
        if (inResourcesSection) {
          resourcesItems.push(trimmed);
        } else if (inSelfAssessment) {
          assessmentQuestions.push(trimmed);
        } else {
          if (!inList) {
            inList = true;
          }
          listItems.push(trimmed);
        }
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        flushList();
        const text = trimmed.substring(2, trimmed.length - 2);
        currentParagraph.push(`**${text}**`);
      } else if (trimmed === '') {
        flushParagraph();
        flushList();
        if (!inResourcesSection) {
          flushResources();
        }
      } else if (trimmed.startsWith('DISCLAIMER:')) {
        flushParagraph();
        flushList();
        flushResources();
        elements.push(
          <div key={`disclaimer-${idx}`} className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">{trimmed}</p>
          </div>
        );
      } else if (trimmed.startsWith('http')) {
        if (inResourcesSection) {
          resourcesItems.push(trimmed);
        } else {
          flushList();
          if (trimmed.length > 0) {
            currentParagraph.push(trimmed);
          }
        }
      } else {
        flushList();
        if (trimmed.length > 0) {
          if (inResourcesSection) {
            resourcesItems.push(trimmed);
          } else {
            currentParagraph.push(trimmed);
          }
        }
      }
    });

    flushParagraph();
    flushList();
    flushResources();
    
    // Flush any remaining assessment questions
    if (inSelfAssessment && assessmentQuestions.length > 0) {
      elements.push(
        <div key={`assessment-final`} className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl">
          <div className="space-y-3">
            {assessmentQuestions.map((question, qIdx) => {
              const questionId = `assessment-${articleId}-final-${qIdx}`;
              const isChecked = assessmentAnswers[questionId] || false;
              return (
                <label key={qIdx} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setAssessmentAnswers(prev => ({ ...prev, [questionId]: e.target.checked }))}
                    className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium">{processText(question.replace(/^[-*]\s*/, ''))}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pb-24">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
      >
        ← Back to LaidOff
      </button>

      <article className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-6">{article.title}</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {renderContent(article.content)}
        </div>
      </article>
    </div>
  );
};

