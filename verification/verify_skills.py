import time
from playwright.sync_api import sync_playwright, expect

def verify_skills_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Start on the landing page
        print("Navigating to home page...")
        page.goto("http://localhost:3000")

        # 2. Sign in as guest to access protected routes
        print("Signing in as guest...")
        guest_btn = page.get_by_role("button", name="Live Demo")
        if guest_btn.is_visible():
            guest_btn.click()
            # Wait for navigation to dashboard
            page.wait_for_url("**/dashboard")
        else:
            print("Guest button not found, trying direct navigation...")

        # 3. Navigate to Skills Ledger
        print("Navigating to Skills Ledger...")
        page.goto("http://localhost:3000/skills")

        # 4. Add a dummy skill if none exists
        # Check if "No skills added yet" is visible
        empty_state = page.get_by_text("No skills added yet")
        if empty_state.is_visible():
            print("Adding a dummy skill...")
            page.get_by_role("button", name="Add Skill").click()
            page.get_by_label("Skill Name").fill("Accessibility")
            page.get_by_role("button", name="Save Skill").click()
            # Wait for skill to appear
            page.wait_for_selector("h3:has-text('Accessibility')")

        # 5. Verify Accessibility: Tab to buttons
        print("Verifying keyboard accessibility...")
        # Skill card title
        skill_title = page.get_by_role("heading", name="Accessibility")

        # Tab through the page until we reach the skill card buttons
        # The first skill card's buttons should be in tab order
        page.keyboard.press("Tab")
        time.sleep(0.5)

        # Try to find the Edit button by aria-label
        edit_btn = page.get_by_label("Edit Accessibility skill")
        delete_btn = page.get_by_label("Delete Accessibility skill")

        # Focus the edit button
        edit_btn.focus()
        page.wait_for_timeout(500) # Allow animation

        # Take screenshot of focused buttons (they should be visible now)
        page.screenshot(path="verification/skills_focus.png")
        print("Screenshot saved to verification/skills_focus.png")

        # 6. Verify Delete Confirmation
        print("Verifying delete confirmation...")
        # We can't easily 'see' the dialog in a screenshot without a lot of work,
        # but we can verify it doesn't delete immediately if we dismiss it
        # Actually, let's just trigger it and see if we can capture it

        # Define dialog handler
        dialog_message = []
        def handle_dialog(dialog):
            dialog_message.append(dialog.message)
            dialog.dismiss()

        page.on("dialog", handle_dialog)
        delete_btn.click()

        if dialog_message:
            print(f"Dialog appeared with message: {dialog_message[0]}")
        else:
            print("FAILED: Delete confirmation dialog did not appear!")

        browser.close()

if __name__ == "__main__":
    verify_skills_ux()
