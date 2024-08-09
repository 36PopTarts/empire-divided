Hooks.on("init", () => {
    // Override map notes to use the BackgroundlessControlIcon
    Note.prototype._drawControlIcon = function () {
        const iconData = getIconData(this);
        const hasBackground = this.document.getFlag(
            "backgroundless-pins",
            "hasBackground"
        );
        const IconClass = hasBackground
            ? ControlIcon
            : BackgroundlessControlIcon;
        const icon = new IconClass(iconData);
        icon.x -= this.size / 2;
        icon.y -= this.size / 2;
        return icon;
    };
});

function getIconData(note) {
    const tint = isV10OrLater()
        ? Color.from(note.document.texture.tint || null)
        : note.data.iconTint
            ? colorStringToHex(note.data.iconTint)
            : null;

    const texture = isV10OrLater() ? note.document.texture.src : note.data.icon;

    return { texture, size: note.size, tint };
}

Hooks.on("renderNoteConfig", (noteConfig, html, _) => {
    const hasBackground = noteConfig.document.getFlag("backgroundless-pins", "hasBackground") ?? false;
    const iconTintGroup = html.find("[name='texture.tint']").closest(".form-group");
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
        // Load the icon texture
        this.texture = this.texture ?? (await loadTexture(this.iconSrc));

        // Don't draw a destroyed Control
        if (this.destroyed) return this;

        // Draw border
        this.border
            .clear()
            .lineStyle(2, this.borderColor, 1.0)
            .drawRoundedRect(...this.rect, 5)
            .endFill();
        this.border.visible = false;

        // Draw icon
        this.icon.texture = this.texture;
        this.icon.width = this.icon.height = this.size;
        this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 0xffffff;
        return this;
    }
}

function isV10OrLater() {
    return game.release.generation >= 10;
}
