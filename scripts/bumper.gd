extends StaticBody2D

@onready var core: Polygon2D = $Core
@onready var hit_area: Area2D = $HitArea


func _ready() -> void:
	hit_area.body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node) -> void:
	if not (body is RigidBody2D):
		return
	var tween := create_tween()
	tween.tween_property(core, "scale", Vector2(1.22, 1.22), 0.05)
	tween.tween_property(core, "scale", Vector2.ONE, 0.12)