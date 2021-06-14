Hooks.on("init", () => {
    // Override map notes to use the BackgroundlessControlIcon
    Note.prototype._drawControlIcon = function () {
        let tint = this.data.iconTint ? colorStringToHex(this.data.iconTint) : null;
        let iconData = { texture: this.data.icon, size: this.size, tint: tint };
        let icon;
        if (this.getFlag("backgroundless-pins", "hasBackground")) {
            icon = new ControlIcon(iconData);
        } else {
            icon = new BackgroundlessControlIcon(iconData);
        }
        icon.x -= this.size / 2;
        icon.y -= this.size / 2;
        return icon;
    };
});

Hooks.on("renderNoteConfig", (noteConfig, html, _) => {
    const hasBackground = noteConfig.object.getFlag("backgroundless-pins", "hasBackground") ?? false;
    const iconTintGroup = html.find("[name=iconTint]").closest(".form-group");
    iconTintGroup.after(`
        <div class="form-group">
            <label for="flags.backgroundless-pins.hasBackground">Show Background?</label>
            <input type="checkbox" name="flags.backgroundless-pins.hasBackground" data-dtype="Boolean" ${hasBackground ? "checked" : ""}>
        </div>
    `);
    noteConfig.setPosition({ height: "auto" });
});

export class BackgroundlessControlIcon extends ControlIcon {
    /**
     * Override ControlIcon#draw to remove drawing of the background.
     */
    async draw() {
        // Draw border
        this.border
            .clear()
            .lineStyle(2, this.borderColor, 1.0)
            .drawRoundedRect(...this.rect, 5)
            .endFill();
        this.border.visible = false;

        // Draw icon
        this.icon.texture = this.texture ?? (await loadTexture(this.iconSrc));
        this.icon.width = this.icon.height = this.size;
        this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 0xffffff;
        return this;
    }
}
